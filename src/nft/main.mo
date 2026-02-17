import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat16 "mo:base/Nat16";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Principal "mo:base/Principal";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Json "json";

persistent actor NFT {

  // ===== Types =====

  type HeaderField = (Text, Text);

  type HttpRequest = {
    method : Text;
    url : Text;
    headers : [HeaderField];
    body : Blob;
  };

  type HttpResponse = {
    status_code : Nat16;
    headers : [HeaderField];
    body : Blob;
    streaming_strategy : ?StreamingStrategy;
  };

  type StreamingStrategy = {
    #Callback : {
      callback : query (StreamingCallbackToken) -> async StreamingCallbackHttpResponse;
      token : StreamingCallbackToken;
    };
  };

  type StreamingCallbackToken = {
    key : Text;
    content_encoding : Text;
    index : Nat;
  };

  type StreamingCallbackHttpResponse = {
    body : Blob;
    token : ?StreamingCallbackToken;
  };

  type Account = { owner : Principal; subaccount : ?Blob };

  type Value = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : Blob;
    #Array : [Value];
    #Map : [(Text, Value)];
  };

  type Trait = {
    category : Text;
    value : Text;
  };

  type ActivityEvent = {
    eventType : Text;
    tokenId : Nat;
    from : Text;
    to : Text;
    timestamp : Int;
    tokenName : Text;
    tokenImage : Text;
  };

  type TokenData = {
    owner : Principal;
    name : Text;
    description : Text;
    image : Text;
    mintedAt : Int;
    traits : [Trait];
  };

  // ===== Nat hash helper =====
  transient let natHash = func(n : Nat) : Nat32 {
    var hash : Nat32 = 0;
    var x = n;
    if (x == 0) return 0;
    while (x > 0) {
      hash := hash *% 31 +% Nat16.toNat32(Nat16.fromNat(x % 256));
      x := x / 256;
    };
    hash;
  };

  // ===== Layer 1: Core State =====

  transient let PAGE_SIZE : Nat = 20;

  var _tokensEntries : [(Nat, TokenData)] = [];
  var _ownerTokensEntries : [(Principal, [Nat])] = [];
  var _activityLogEntries : [ActivityEvent] = [];
  var nextTokenId : Nat = 0;
  var collectionName : Text = "ICP Speed NFTs";
  var collectionSymbol : Text = "SPEED";
  var collectionDescription : Text = "OpenSea-speed NFT collection on the Internet Computer. Blazing fast materialized views with pre-computed JSON responses.";

  transient var tokens = HashMap.HashMap<Nat, TokenData>(64, Nat.equal, natHash);
  transient var ownerTokens = HashMap.HashMap<Principal, Buffer.Buffer<Nat>>(64, Principal.equal, Principal.hash);
  transient var activityLog = Buffer.Buffer<ActivityEvent>(256);
  transient var uniqueOwnersCount : Nat = 0;

  // ===== Layer 2: Materialized Views =====

  transient var galleryPages = HashMap.HashMap<Nat, Text>(16, Nat.equal, natHash);
  transient var tokenDetailCache = HashMap.HashMap<Nat, Text>(64, Nat.equal, natHash);
  transient var collectionStatsCache : Text = "";

  // ===== Materialized View Builders =====

  func traitToJson(tr : Trait) : Text {
    Json.obj([
      ("category", Json.string(tr.category)),
      ("value", Json.string(tr.value))
    ]);
  };

  func tokenToJson(id : Nat, t : TokenData) : Text {
    let traitJsons = Array.map<Trait, Text>(t.traits, traitToJson);
    Json.obj([
      ("id", Json.nat(id)),
      ("name", Json.string(t.name)),
      ("description", Json.string(t.description)),
      ("image", Json.string(t.image)),
      ("owner", Json.string(Principal.toText(t.owner))),
      ("mintedAt", Json.nat(Int.abs(t.mintedAt))),
      ("traits", Json.array(traitJsons))
    ]);
  };

  func activityEventToJson(evt : ActivityEvent) : Text {
    Json.obj([
      ("eventType", Json.string(evt.eventType)),
      ("tokenId", Json.nat(evt.tokenId)),
      ("from", Json.string(evt.from)),
      ("to", Json.string(evt.to)),
      ("timestamp", Json.nat(Int.abs(evt.timestamp))),
      ("tokenName", Json.string(evt.tokenName)),
      ("tokenImage", Json.string(evt.tokenImage))
    ]);
  };

  func rebuildGalleryPage(pageNum : Nat) {
    let start = pageNum * PAGE_SIZE;
    let end_ = start + PAGE_SIZE;
    let items = Buffer.Buffer<Text>(PAGE_SIZE);

    var i = start;
    while (i < end_ and i < nextTokenId) {
      switch (tokens.get(i)) {
        case (?t) { items.add(tokenToJson(i, t)) };
        case null {};
      };
      i += 1;
    };

    let totalPages = if (nextTokenId == 0) 1 else (nextTokenId + PAGE_SIZE - 1) / PAGE_SIZE;

    let pageJson = Json.obj([
      ("items", Json.array(Buffer.toArray(items))),
      ("page", Json.nat(pageNum)),
      ("pageSize", Json.nat(PAGE_SIZE)),
      ("totalSupply", Json.nat(nextTokenId)),
      ("totalPages", Json.nat(totalPages))
    ]);

    galleryPages.put(pageNum, pageJson);
  };

  func rebuildTokenDetail(tokenId : Nat) {
    switch (tokens.get(tokenId)) {
      case (?t) { tokenDetailCache.put(tokenId, tokenToJson(tokenId, t)) };
      case null { tokenDetailCache.delete(tokenId) };
    };
  };

  func rebuildCollectionStats() {
    // Build trait summary from all tokens
    let traitCounts = HashMap.HashMap<Text, HashMap.HashMap<Text, Nat>>(16, Text.equal, Text.hash);

    var i : Nat = 0;
    while (i < nextTokenId) {
      switch (tokens.get(i)) {
        case (?t) {
          for (tr in t.traits.vals()) {
            switch (traitCounts.get(tr.category)) {
              case (?valMap) {
                switch (valMap.get(tr.value)) {
                  case (?c) { valMap.put(tr.value, c + 1) };
                  case null { valMap.put(tr.value, 1) };
                };
              };
              case null {
                let valMap = HashMap.HashMap<Text, Nat>(8, Text.equal, Text.hash);
                valMap.put(tr.value, 1);
                traitCounts.put(tr.category, valMap);
              };
            };
          };
        };
        case null {};
      };
      i += 1;
    };

    let traitSummaryBuf = Buffer.Buffer<Text>(16);
    for ((cat, valMap) in traitCounts.entries()) {
      let valuesBuf = Buffer.Buffer<Text>(16);
      for ((val, count) in valMap.entries()) {
        valuesBuf.add(Json.obj([
          ("value", Json.string(val)),
          ("count", Json.nat(count))
        ]));
      };
      traitSummaryBuf.add(Json.obj([
        ("category", Json.string(cat)),
        ("values", Json.array(Buffer.toArray(valuesBuf)))
      ]));
    };

    collectionStatsCache := Json.obj([
      ("name", Json.string(collectionName)),
      ("symbol", Json.string(collectionSymbol)),
      ("description", Json.string(collectionDescription)),
      ("totalSupply", Json.nat(nextTokenId)),
      ("uniqueOwners", Json.nat(uniqueOwnersCount)),
      ("traits", Json.array(Buffer.toArray(traitSummaryBuf)))
    ]);
  };

  func rebuildAllViewsInternal() {
    let totalPages = if (nextTokenId == 0) 1 else (nextTokenId + PAGE_SIZE - 1) / PAGE_SIZE;
    var p : Nat = 0;
    while (p < totalPages) {
      rebuildGalleryPage(p);
      p += 1;
    };

    var i : Nat = 0;
    while (i < nextTokenId) {
      rebuildTokenDetail(i);
      i += 1;
    };

    // Recount unique owners
    uniqueOwnersCount := ownerTokens.size();

    rebuildCollectionStats();
  };

  // ===== HTTP URL Parsing =====

  func getPath(url : Text) : Text {
    let parts = Iter.toArray(Text.split(url, #char '?'));
    if (parts.size() > 0) parts[0] else url;
  };

  func getQueryParam(url : Text, key : Text) : ?Text {
    let urlParts = Iter.toArray(Text.split(url, #char '?'));
    if (urlParts.size() < 2) return null;
    let params = Iter.toArray(Text.split(urlParts[1], #char '&'));
    for (param in params.vals()) {
      let kv = Iter.toArray(Text.split(param, #char '='));
      if (kv.size() == 2 and kv[0] == key) {
        return ?kv[1];
      };
    };
    null;
  };

  func jsonResponse(body : Text) : HttpResponse {
    {
      status_code = 200;
      headers = [
        ("Content-Type", "application/json"),
        ("Cache-Control", "public, max-age=5"),
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type")
      ];
      body = Text.encodeUtf8(body);
      streaming_strategy = null;
    };
  };

  func notFound() : HttpResponse {
    {
      status_code = 404;
      headers = [("Content-Type", "application/json"), ("Access-Control-Allow-Origin", "*")];
      body = Text.encodeUtf8("{\"error\":\"Not found\"}");
      streaming_strategy = null;
    };
  };

  // ===== HTTP Interface =====

  public query func http_request(req : HttpRequest) : async HttpResponse {
    let path = getPath(req.url);

    // OPTIONS preflight
    if (req.method == "OPTIONS") {
      return {
        status_code = 204;
        headers = [
          ("Access-Control-Allow-Origin", "*"),
          ("Access-Control-Allow-Methods", "GET, OPTIONS"),
          ("Access-Control-Allow-Headers", "Content-Type")
        ];
        body = Blob.fromArray([]);
        streaming_strategy = null;
      };
    };

    // GET /api/gallery?page=N
    if (path == "/api/gallery") {
      let pageStr = Option.get(getQueryParam(req.url, "page"), "0");
      let page = Option.get(Nat.fromText(pageStr), 0);
      switch (galleryPages.get(page)) {
        case (?json) { return jsonResponse(json) };
        case null {
          return jsonResponse(Json.obj([
            ("items", Json.array([])),
            ("page", Json.nat(page)),
            ("pageSize", Json.nat(PAGE_SIZE)),
            ("totalSupply", Json.nat(nextTokenId)),
            ("totalPages", Json.nat(if (nextTokenId == 0) 1 else (nextTokenId + PAGE_SIZE - 1) / PAGE_SIZE))
          ]));
        };
      };
    };

    // GET /api/token/{id}
    if (Text.startsWith(path, #text "/api/token/")) {
      let segments = Iter.toArray(Text.split(path, #char '/'));
      if (segments.size() >= 4) {
        switch (Nat.fromText(segments[3])) {
          case (?id) {
            switch (tokenDetailCache.get(id)) {
              case (?json) { return jsonResponse(json) };
              case null { return notFound() };
            };
          };
          case null { return notFound() };
        };
      };
      return notFound();
    };

    // GET /api/collection
    if (path == "/api/collection") {
      return jsonResponse(collectionStatsCache);
    };

    // GET /api/activity?page=N
    if (path == "/api/activity") {
      let pageStr = Option.get(getQueryParam(req.url, "page"), "0");
      let page = Option.get(Nat.fromText(pageStr), 0);
      let total = activityLog.size();
      let start = page * PAGE_SIZE;
      let items = Buffer.Buffer<Text>(PAGE_SIZE);

      var i : Nat = 0;
      while (i < PAGE_SIZE and start + i < total) {
        let idx : Nat = total - 1 - start - i;
        let evt = activityLog.get(idx);
        items.add(activityEventToJson(evt));
        i += 1;
      };

      let totalPages = if (total == 0) 1 else (total + PAGE_SIZE - 1) / PAGE_SIZE;
      return jsonResponse(Json.obj([
        ("items", Json.array(Buffer.toArray(items))),
        ("page", Json.nat(page)),
        ("totalEvents", Json.nat(total)),
        ("totalPages", Json.nat(totalPages))
      ]));
    };

    // GET /api/activity/token/{id}?page=N
    if (Text.startsWith(path, #text "/api/activity/token/")) {
      let segments = Iter.toArray(Text.split(path, #char '/'));
      if (segments.size() >= 5) {
        switch (Nat.fromText(segments[4])) {
          case (?targetId) {
            let pageStr = Option.get(getQueryParam(req.url, "page"), "0");
            let page = Option.get(Nat.fromText(pageStr), 0);

            // Collect matching events in reverse order
            let matches = Buffer.Buffer<Text>(32);
            let total = activityLog.size();
            if (total > 0) {
              var j : Nat = total;
              while (j > 0) {
                j -= 1;
                let evt = activityLog.get(j);
                if (evt.tokenId == targetId) {
                  matches.add(activityEventToJson(evt));
                };
              };
            };

            let matchTotal = matches.size();
            let start = page * PAGE_SIZE;
            let pageItems = Buffer.Buffer<Text>(PAGE_SIZE);
            var k : Nat = start;
            while (k < start + PAGE_SIZE and k < matchTotal) {
              pageItems.add(matches.get(k));
              k += 1;
            };

            let totalPages = if (matchTotal == 0) 1 else (matchTotal + PAGE_SIZE - 1) / PAGE_SIZE;
            return jsonResponse(Json.obj([
              ("items", Json.array(Buffer.toArray(pageItems))),
              ("page", Json.nat(page)),
              ("totalEvents", Json.nat(matchTotal)),
              ("totalPages", Json.nat(totalPages))
            ]));
          };
          case null { return notFound() };
        };
      };
      return notFound();
    };

    // GET /api/search?q=term&page=N
    if (path == "/api/search") {
      let searchTerm = Option.get(getQueryParam(req.url, "q"), "");
      let pageStr = Option.get(getQueryParam(req.url, "page"), "0");
      let page = Option.get(Nat.fromText(pageStr), 0);
      let lowerQuery = Text.toLowercase(searchTerm);

      let matches = Buffer.Buffer<(Nat, TokenData)>(64);
      var i : Nat = 0;
      while (i < nextTokenId) {
        switch (tokens.get(i)) {
          case (?t) {
            if (Text.contains(Text.toLowercase(t.name), #text lowerQuery)) {
              matches.add((i, t));
            };
          };
          case null {};
        };
        i += 1;
      };

      let start = page * PAGE_SIZE;
      let items = Buffer.Buffer<Text>(PAGE_SIZE);
      var j : Nat = start;
      while (j < start + PAGE_SIZE and j < matches.size()) {
        let (id, t) = matches.get(j);
        items.add(tokenToJson(id, t));
        j += 1;
      };

      let totalPages = if (matches.size() == 0) 1 else (matches.size() + PAGE_SIZE - 1) / PAGE_SIZE;
      return jsonResponse(Json.obj([
        ("items", Json.array(Buffer.toArray(items))),
        ("page", Json.nat(page)),
        ("totalResults", Json.nat(matches.size())),
        ("totalPages", Json.nat(totalPages))
      ]));
    };

    // GET /api/tokens/owner/{principal}?page=N
    if (Text.startsWith(path, #text "/api/tokens/owner/")) {
      let segments = Iter.toArray(Text.split(path, #char '/'));
      if (segments.size() >= 5) {
        let principalText = segments[4];
        let principal = Principal.fromText(principalText);
        let pageStr = Option.get(getQueryParam(req.url, "page"), "0");
        let page = Option.get(Nat.fromText(pageStr), 0);

        switch (ownerTokens.get(principal)) {
          case (?tokenIds) {
            let ids = Buffer.toArray(tokenIds);
            let start = page * PAGE_SIZE;
            let items = Buffer.Buffer<Text>(PAGE_SIZE);

            var i : Nat = start;
            while (i < start + PAGE_SIZE and i < ids.size()) {
              let tokenId = ids[i];
              switch (tokens.get(tokenId)) {
                case (?t) { items.add(tokenToJson(tokenId, t)) };
                case null {};
              };
              i += 1;
            };

            let totalPages = if (ids.size() == 0) 1 else (ids.size() + PAGE_SIZE - 1) / PAGE_SIZE;
            return jsonResponse(Json.obj([
              ("items", Json.array(Buffer.toArray(items))),
              ("page", Json.nat(page)),
              ("pageSize", Json.nat(PAGE_SIZE)),
              ("totalTokens", Json.nat(ids.size())),
              ("totalPages", Json.nat(totalPages))
            ]));
          };
          case null {
            return jsonResponse(Json.obj([
              ("items", Json.array([])),
              ("page", Json.nat(0)),
              ("pageSize", Json.nat(PAGE_SIZE)),
              ("totalTokens", Json.nat(0)),
              ("totalPages", Json.nat(1))
            ]));
          };
        };
      };
      return notFound();
    };

    // Fallback
    notFound();
  };

  // ===== Write Methods =====

  public shared(_msg) func mint(to : Principal, name : Text, description : Text, image : Text, traits : [Trait]) : async Nat {
    let id = nextTokenId;
    let now = Time.now();
    let tokenData : TokenData = {
      owner = to;
      name = name;
      description = description;
      image = image;
      mintedAt = now;
      traits = traits;
    };

    tokens.put(id, tokenData);

    // Track unique owners
    let isNewOwner = switch (ownerTokens.get(to)) {
      case (?_buf) { false };
      case null { true };
    };

    // Update owner index
    switch (ownerTokens.get(to)) {
      case (?buf) { buf.add(id) };
      case null {
        let buf = Buffer.Buffer<Nat>(8);
        buf.add(id);
        ownerTokens.put(to, buf);
      };
    };

    if (isNewOwner) { uniqueOwnersCount += 1 };

    // Log activity
    activityLog.add({
      eventType = "Mint";
      tokenId = id;
      from = "0x0";
      to = Principal.toText(to);
      timestamp = now;
      tokenName = name;
      tokenImage = image;
    });

    nextTokenId += 1;

    // Rebuild materialized views
    rebuildTokenDetail(id);
    rebuildCollectionStats();
    let totalPages = (nextTokenId + PAGE_SIZE - 1) / PAGE_SIZE;
    var p : Nat = 0;
    while (p < totalPages) {
      rebuildGalleryPage(p);
      p += 1;
    };

    id;
  };

  public shared(msg) func transfer(tokenId : Nat, to : Principal) : async Bool {
    switch (tokens.get(tokenId)) {
      case (?t) {
        if (t.owner != msg.caller) return false;

        let from = t.owner;

        let updated : TokenData = {
          owner = to;
          name = t.name;
          description = t.description;
          image = t.image;
          mintedAt = t.mintedAt;
          traits = t.traits;
        };
        tokens.put(tokenId, updated);

        // Remove from old owner's list
        switch (ownerTokens.get(from)) {
          case (?buf) {
            let newBuf = Buffer.Buffer<Nat>(buf.size());
            for (id in buf.vals()) {
              if (id != tokenId) newBuf.add(id);
            };
            if (newBuf.size() == 0) {
              ownerTokens.delete(from);
              uniqueOwnersCount -= 1;
            } else {
              ownerTokens.put(from, newBuf);
            };
          };
          case null {};
        };

        // Add to new owner's list
        let isNewOwner = switch (ownerTokens.get(to)) {
          case (?_buf) { false };
          case null { true };
        };
        switch (ownerTokens.get(to)) {
          case (?buf) { buf.add(tokenId) };
          case null {
            let buf = Buffer.Buffer<Nat>(8);
            buf.add(tokenId);
            ownerTokens.put(to, buf);
          };
        };
        if (isNewOwner) { uniqueOwnersCount += 1 };

        // Log activity
        activityLog.add({
          eventType = "Transfer";
          tokenId = tokenId;
          from = Principal.toText(from);
          to = Principal.toText(to);
          timestamp = Time.now();
          tokenName = t.name;
          tokenImage = t.image;
        });

        // Rebuild affected views
        rebuildTokenDetail(tokenId);
        rebuildCollectionStats();
        let affectedPage = tokenId / PAGE_SIZE;
        rebuildGalleryPage(affectedPage);

        true;
      };
      case null { false };
    };
  };

  // ===== ICRC-7 Query Methods =====

  public query func icrc7_name() : async Text { collectionName };
  public query func icrc7_symbol() : async Text { collectionSymbol };
  public query func icrc7_total_supply() : async Nat { nextTokenId };

  public query func icrc7_balance_of(account : Account) : async Nat {
    switch (ownerTokens.get(account.owner)) {
      case (?buf) { buf.size() };
      case null { 0 };
    };
  };

  public query func icrc7_owner_of(token_ids : [Nat]) : async [?Account] {
    Array.map<Nat, ?Account>(token_ids, func(id : Nat) : ?Account {
      switch (tokens.get(id)) {
        case (?t) { ?{ owner = t.owner; subaccount = null } };
        case null { null };
      };
    });
  };

  public query func icrc7_tokens(prev : ?Nat, take : ?Nat) : async [Nat] {
    let start = switch (prev) { case (?p) { p + 1 }; case null { 0 } };
    let limit = switch (take) { case (?t) { t }; case null { 100 } };
    let buf = Buffer.Buffer<Nat>(limit);
    var i = start;
    while (i < nextTokenId and buf.size() < limit) {
      if (tokens.get(i) != null) buf.add(i);
      i += 1;
    };
    Buffer.toArray(buf);
  };

  public query func icrc7_tokens_of(account : Account, prev : ?Nat, take : ?Nat) : async [Nat] {
    switch (ownerTokens.get(account.owner)) {
      case (?buf) {
        let limit = switch (take) { case (?t) { t }; case null { 100 } };
        let start = switch (prev) { case (?p) { p + 1 }; case null { 0 } };
        let result = Buffer.Buffer<Nat>(limit);
        var started = start == 0;
        for (id in buf.vals()) {
          if (result.size() >= limit) return Buffer.toArray(result);
          if (started) {
            result.add(id);
          } else if (id == start - 1) {
            started := true;
          };
        };
        Buffer.toArray(result);
      };
      case null { [] };
    };
  };

  public query func icrc7_token_metadata(token_ids : [Nat]) : async [?[(Text, Value)]] {
    Array.map<Nat, ?[(Text, Value)]>(token_ids, func(id : Nat) : ?[(Text, Value)] {
      switch (tokens.get(id)) {
        case (?t) {
          ?[
            ("icrc7:metadata:uri:name", #Text(t.name)),
            ("icrc7:metadata:uri:description", #Text(t.description)),
            ("icrc7:metadata:uri:image", #Text(t.image)),
            ("icrc7:metadata:uri:owner", #Text(Principal.toText(t.owner)))
          ]
        };
        case null { null };
      };
    });
  };

  // ===== Admin =====

  public func rebuildAllViews() : async () {
    rebuildAllViewsInternal();
  };

  // ===== Upgrade Persistence =====

  system func preupgrade() {
    _tokensEntries := Iter.toArray(tokens.entries());
    let ownerBuf = Buffer.Buffer<(Principal, [Nat])>(ownerTokens.size());
    for ((k, v) in ownerTokens.entries()) {
      ownerBuf.add((k, Buffer.toArray(v)));
    };
    _ownerTokensEntries := Buffer.toArray(ownerBuf);
    _activityLogEntries := Buffer.toArray(activityLog);
  };

  system func postupgrade() {
    for ((k, v) in _tokensEntries.vals()) {
      tokens.put(k, v);
    };
    _tokensEntries := [];

    for ((k, v) in _ownerTokensEntries.vals()) {
      let buf = Buffer.Buffer<Nat>(v.size());
      for (id in v.vals()) { buf.add(id) };
      ownerTokens.put(k, buf);
    };
    _ownerTokensEntries := [];

    for (evt in _activityLogEntries.vals()) {
      activityLog.add(evt);
    };
    _activityLogEntries := [];

    rebuildAllViewsInternal();
  };

  // Initialize views on first deploy
  rebuildCollectionStats();
  rebuildGalleryPage(0);
};
