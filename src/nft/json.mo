import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";

module {

  public func escapeString(t : Text) : Text {
    var result = "";
    for (c in t.chars()) {
      if (c == '\"') { result #= "\\\"" }
      else if (c == '\\') { result #= "\\\\" }
      else if (c == '\n') { result #= "\\n" }
      else if (c == '\r') { result #= "\\r" }
      else if (c == '\t') { result #= "\\t" }
      else { result #= Text.fromChar(c) };
    };
    result;
  };

  public func string(t : Text) : Text {
    "\"" # escapeString(t) # "\"";
  };

  public func nat(n : Nat) : Text {
    Nat.toText(n);
  };

  public func bool(b : Bool) : Text {
    if (b) "true" else "false";
  };

  public func null_() : Text { "null" };

  public func array(items : [Text]) : Text {
    "[" # Text.join(",", items.vals()) # "]";
  };

  public func obj(fields : [(Text, Text)]) : Text {
    let pairs = Array.map<(Text, Text), Text>(fields, func(pair : (Text, Text)) : Text {
      "\"" # escapeString(pair.0) # "\":" # pair.1;
    });
    "{" # Text.join(",", pairs.vals()) # "}";
  };
};
