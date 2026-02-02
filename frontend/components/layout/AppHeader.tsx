'use client';

interface AppHeaderProps {
  hideMenu?: boolean;
}

export function AppHeader({ hideMenu = false }: AppHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className={`flex items-center ${hideMenu ? 'justify-center' : 'justify-between'}`}>
          {hideMenu ? (
            <h1 className="text-2xl font-bold text-gray-900">AstraGO</h1>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">AstraGO</h1>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
