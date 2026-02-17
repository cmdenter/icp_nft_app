import React from 'react';
import { MintForm } from '../components/MintForm';
import { Breadcrumbs } from '../components/Breadcrumbs';

const Mint: React.FC = () => (
  <div>
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Create NFT' }]} />
    </div>
    <MintForm />
  </div>
);

export default Mint;
