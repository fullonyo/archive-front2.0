import { useState } from 'react';
import Container from '../components/layout/Container';
import PageHeader from '../components/common/PageHeader';
import AssetCard from '../components/assets/AssetCard';
import { Plus, Filter } from 'lucide-react';

/**
 * EXEMPLO: Como usar o novo sistema de layout
 * 
 * Este é um exemplo completo mostrando as melhores práticas
 * para criar páginas no Archive Nyo seguindo o padrão daily.dev
 */

const ExamplePage = () => {
  const [filter, setFilter] = useState('all');

  // Mock data
  const assets = [
    { id: 1, title: 'Asset 1', /* ... */ },
    { id: 2, title: 'Asset 2', /* ... */ },
  ];

  return (
    <Container variant="default">
      {/* Page Header com ação */}
      <PageHeader 
        title="My Assets"
        description="Manage your uploaded assets and track performance"
        action={
          <button className="btn btn-primary">
            <Plus size={18} />
            Upload New
          </button>
        }
      />

      {/* Filter Section */}
      <div className="bg-surface-float/50 rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-text-tertiary" />
          <div className="flex gap-2">
            {['all', 'published', 'pending', 'draft'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${filter === status 
                    ? 'bg-theme-active text-white' 
                    : 'bg-surface-float text-text-secondary hover:bg-surface-float2'
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Grid - Responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {assets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>

      {/* Empty State */}
      {assets.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-text-tertiary mb-4">
            <Plus size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No assets yet</h3>
          <p className="text-text-secondary mb-6">
            Start by uploading your first asset
          </p>
          <button className="btn btn-primary mx-auto">
            <Plus size={18} />
            Upload Asset
          </button>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 pt-4 pb-8">
        <button className="btn btn-secondary">Previous</button>
        <button className="btn btn-primary">1</button>
        <button className="btn btn-secondary">2</button>
        <button className="btn btn-secondary">3</button>
        <button className="btn btn-secondary">Next</button>
      </div>
    </Container>
  );
};

export default ExamplePage;


/**
 * ==========================================
 * EXEMPLOS DE VARIAÇÕES DE CONTAINER
 * ==========================================
 */

// 1. Container Padrão (Grid de 3 colunas)
const GridPage = () => (
  <Container variant="default">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {/* Cards */}
    </div>
  </Container>
);

// 2. Container Narrow (Conteúdo de leitura)
const ArticlePage = () => (
  <Container variant="narrow">
    <article className="prose prose-invert">
      <h1>Article Title</h1>
      <p>Long form content...</p>
    </article>
  </Container>
);

// 3. Container Full (Sem limitação de largura)
const DashboardPage = () => (
  <Container variant="full">
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">{/* Main content */}</div>
      <div className="col-span-4">{/* Sidebar */}</div>
    </div>
  </Container>
);

// 4. Container sem padding (Para controle total)
const CustomLayoutPage = () => (
  <Container noPadding>
    <div className="custom-layout">
      {/* Seu layout customizado */}
    </div>
  </Container>
);


/**
 * ==========================================
 * EXEMPLOS DE GRIDS RESPONSIVOS
 * ==========================================
 */

// Grid de 3 colunas (padrão para assets)
const ThreeColumnGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {/* 1 col em mobile, 2 em tablet, 3 em desktop */}
  </div>
);

// Grid de 4 colunas (para categorias)
const FourColumnGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* 1 col em xs, 2 em sm, 4 em lg */}
  </div>
);

// Grid de 2 colunas (para featured items)
const TwoColumnGrid = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* 1 col em mobile/tablet, 2 em desktop */}
  </div>
);

// Auto-fit grid (adapta automaticamente)
const AutoFitGrid = () => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
    {/* CSS Grid auto-fit para larguras dinâmicas */}
  </div>
);


/**
 * ==========================================
 * EXEMPLOS DE SPACING
 * ==========================================
 */

const SpacingExample = () => (
  <Container>
    {/* Spacing entre seções principais */}
    <div className="space-y-10">
      
      {/* Section 1 */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Section Title</h2>
        <div className="grid grid-cols-3 gap-5">
          {/* Cards com gap de 20px */}
        </div>
      </section>

      {/* Section 2 */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Another Section</h2>
        <div className="space-y-4">
          {/* Items verticais com gap de 16px */}
        </div>
      </section>

    </div>
  </Container>
);


/**
 * ==========================================
 * EXEMPLOS DE CARDS CUSTOMIZADOS
 * ==========================================
 */

// Card básico
const BasicCard = () => (
  <div className="card p-6">
    <h3 className="font-semibold mb-2">Card Title</h3>
    <p className="text-text-secondary">Card content</p>
  </div>
);

// Card com hover effect
const HoverCard = () => (
  <div className="card p-6 cursor-pointer group hover:scale-[1.02] transition-transform">
    <h3 className="font-semibold mb-2 group-hover:text-theme-active transition-colors">
      Interactive Card
    </h3>
    <p className="text-text-secondary">Hover me!</p>
  </div>
);

// Card com gradient header
const GradientCard = () => (
  <div className="card p-0 overflow-hidden">
    <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex items-center">
      <h3 className="text-xl font-bold text-white">Gradient Header</h3>
    </div>
    <div className="p-6">
      <p className="text-text-secondary">Card content</p>
    </div>
  </div>
);


/**
 * ==========================================
 * EXEMPLOS DE FILTROS E CONTROLES
 * ==========================================
 */

const FiltersExample = () => {
  const [selected, setSelected] = useState('all');

  return (
    <div className="bg-surface-float/50 rounded-xl p-4 border border-white/5">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'new', 'popular', 'trending'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelected(filter)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selected === filter 
                  ? 'bg-theme-active text-white' 
                  : 'bg-surface-float text-text-secondary hover:bg-surface-float2'
                }
              `}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <input 
          type="text"
          placeholder="Search..."
          className="input max-w-xs"
        />

      </div>
    </div>
  );
};
