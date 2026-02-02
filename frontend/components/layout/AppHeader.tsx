'use client';

interface AppHeaderProps {
  hideMenu?: boolean;
}

export function AppHeader({ hideMenu = false }: AppHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className={`flex items-center ${hideMenu ? 'justify-center' : 'justify-start'}`}>
          {hideMenu ? (
            <h1 className="text-2xl font-bold text-gray-900">AstraGO</h1>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AstraGO</h1>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
