import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode2, Copy, Check, ChevronRight, ChevronDown, Search, FolderOpen, Folder, X } from 'lucide-react';

interface CodeViewerProps {
  files: { filename: string; code: string }[];
  currentStep: number;
  onCopyFile: (code: string) => void;
}

// Simple syntax highlighting for Dart
function highlightDart(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    let highlighted = line
      .replace(/\/\/.*/g, '<span class="code-comment">$&</span>')
      .replace(/('.*?'|".*?")/g, '<span class="code-string">$1</span>')
      .replace(/\b(import|class|extends|implements|with|const|final|var|void|int|double|String|bool|List|Map|Future|async|await|return|if|else|switch|case|for|while|break|continue|try|catch|throw|new|this|super|static|late|required|override|enum|abstract|mixin)\b/g, '<span class="code-keyword">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="code-literal">$1</span>')
      .replace(/@\w+/g, '<span class="code-annotation">$&</span>')
      .replace(/\b([A-Z]\w+)\b/g, (match) => {
        if (match.match(/^(String|List|Map|Future|int|double|bool)$/)) return match;
        return `<span class="code-type">${match}</span>`;
      });
    return (
      <div key={i} className="code-line group flex">
        <span className="code-line-number w-10 text-right pr-3 select-none shrink-0 text-dim opacity-40 group-hover:opacity-70 transition-opacity">
          {i + 1}
        </span>
        <span className="code-content flex-1" dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
      </div>
    );
  });
}

// Build file tree structure
function buildFileTree(files: { filename: string }[]): { folders: Set<string>; tree: Map<string, string[]> } {
  const folders = new Set<string>();
  const tree = new Map<string, string[]>();
  
  files.forEach(f => {
    const parts = f.filename.split('/');
    if (parts.length > 1) {
      const folder = parts.slice(0, -1).join('/');
      folders.add(folder);
      if (!tree.has(folder)) tree.set(folder, []);
      tree.get(folder)!.push(f.filename);
    } else {
      if (!tree.has('root')) tree.set('root', []);
      tree.get('root')!.push(f.filename);
    }
  });

  return { folders, tree };
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files, currentStep, onCopyFile }) => {
  const [activeFile, setActiveFile] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showTree, setShowTree] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  const visibleFiles = useMemo(() => {
    const count = Math.min(files.length, Math.max(1, Math.ceil((currentStep / 9) * files.length)));
    return files.slice(0, count);
  }, [files, currentStep]);

  const filteredCode = useMemo(() => {
    if (!visibleFiles[activeFile]) return [];
    const code = visibleFiles[activeFile].code;
    if (!searchQuery) return highlightDart(code);
    return highlightDart(code);
  }, [visibleFiles, activeFile, searchQuery]);

  const { tree } = useMemo(() => buildFileTree(visibleFiles), [visibleFiles]);

  const handleCopy = useCallback((idx: number) => {
    onCopyFile(visibleFiles[idx].code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 2000);
  }, [visibleFiles, onCopyFile]);

  const toggleFolder = useCallback((folder: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder); else next.add(folder);
      return next;
    });
  }, []);

  if (visibleFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <FileCode2 size={24} className="text-purple-400" />
        </motion.div>
        <p className="text-dim text-xs">Generating code...</p>
      </div>
    );
  }

  const safeActive = Math.min(activeFile, visibleFiles.length - 1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileCode2 size={14} className="text-purple-400" />
          <span className="text-xs font-bold text-hero uppercase tracking-wider">Flutter Code</span>
          <span className="text-[10px] text-dim bg-purple-500/10 px-2 py-0.5 rounded-full">
            {visibleFiles.length} files
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowTree(!showTree)}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all"
            title="Toggle file tree"
          >
            <FolderOpen size={12} className={showTree ? 'text-green-400' : 'text-dim'} />
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all"
            title="Search in code"
          >
            <Search size={12} className={showSearch ? 'text-green-400' : 'text-dim'} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-2">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search in code..."
                className="w-full pl-8 pr-8 py-2 rounded-lg input-field text-xs focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                  <X size={12} className="text-dim hover:text-sub" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 gap-2 min-h-0 overflow-hidden">
        {/* File Tree */}
        <AnimatePresence>
          {showTree && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 overflow-y-auto overflow-x-hidden border-r border-soft pr-2"
            >
              {Array.from(tree.entries()).map(([folder, fileNames]) => (
                <div key={folder} className="mb-1">
                  {folder !== 'root' && (
                    <button
                      onClick={() => toggleFolder(folder)}
                      className="flex items-center gap-1 text-[10px] text-sub hover:text-hero w-full py-0.5 cursor-pointer transition-colors"
                    >
                      {expandedFolders.has(folder) ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                      <Folder size={10} className="text-amber-400" />
                      <span className="truncate">{folder.split('/').pop()}</span>
                    </button>
                  )}
                  {(folder === 'root' || expandedFolders.has(folder)) && (
                    <div className={folder !== 'root' ? 'ml-3' : ''}>
                      {fileNames.map(fn => {
                        const idx = visibleFiles.findIndex(f => f.filename === fn);
                        const isActive = idx === safeActive;
                        return (
                          <button
                            key={fn}
                            onClick={() => setActiveFile(idx)}
                            className={`flex items-center gap-1 text-[10px] w-full py-0.5 px-1 rounded cursor-pointer transition-all truncate ${
                              isActive ? 'text-green-400 bg-green-500/10' : 'text-dim hover:text-sub hover:bg-white/5'
                            }`}
                          >
                            <FileCode2 size={9} className="shrink-0" />
                            <span className="truncate">{fn.split('/').pop()}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* File tabs */}
          <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1 shrink-0">
            {visibleFiles.map((file, idx) => (
              <motion.button
                key={file.filename}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveFile(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap cursor-pointer transition-all ${
                  idx === safeActive
                    ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                    : 'text-dim hover:text-sub hover:bg-white/5'
                }`}
              >
                <FileCode2 size={10} />
                {file.filename.split('/').pop()}
              </motion.button>
            ))}
          </div>

          {/* Active file header */}
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="text-[10px] font-mono text-dim truncate">
              lib/{visibleFiles[safeActive]?.filename}
            </span>
            <button
              onClick={() => handleCopy(safeActive)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium cursor-pointer transition-all ${
                copiedIdx === safeActive
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-white/5 text-dim hover:text-sub hover:bg-white/10'
              }`}
            >
              {copiedIdx === safeActive ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
            </button>
          </div>

          {/* Code content */}
          <div className="flex-1 overflow-auto rounded-xl bg-black/20 border border-soft font-mono text-[11px] leading-[1.7] p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={safeActive}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {filteredCode}
                {currentStep < 9 && safeActive === visibleFiles.length - 1 && (
                  <div className="code-line flex items-center gap-2 mt-1">
                    <span className="code-line-number w-10 text-right pr-3 text-dim opacity-40">
                      {visibleFiles[safeActive]?.code.split('\n').length + 1}
                    </span>
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-green-400 text-[10px]"
                    >
                      █ writing...
                    </motion.span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
