import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, FileCode, ChevronDown, ChevronRight, Code2, Sparkles } from 'lucide-react';

interface CodeFile {
  filename: string;
  code: string;
}

interface CodeViewerProps {
  files: CodeFile[];
  currentStep: number;
  onCopyFile?: (code: string) => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files, currentStep, onCopyFile }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set([0]));
  const [visibleLines, setVisibleLines] = useState<Record<number, number>>({});

  // Determine which files are visible based on the current step
  const getVisibleFileCount = () => {
    if (currentStep >= 9) return files.length;
    if (currentStep >= 8) return Math.min(5, files.length);
    if (currentStep >= 6) return Math.min(4, files.length);
    if (currentStep >= 4) return Math.min(3, files.length);
    if (currentStep >= 3) return Math.min(2, files.length);
    if (currentStep >= 1) return Math.min(1, files.length);
    return 0;
  };

  const visibleFileCount = getVisibleFileCount();
  const visibleFiles = files.slice(0, visibleFileCount);

  // Simulate streaming lines for the latest file
  useEffect(() => {
    if (visibleFileCount <= 0) return;
    
    const latestIdx = visibleFileCount - 1;
    const file = files[latestIdx];
    if (!file) return;
    
    const totalLines = file.code.split('\n').length;
    
    // If this file already has all lines, skip
    if (visibleLines[latestIdx] >= totalLines) return;

    // Start streaming lines
    setVisibleLines(prev => ({ ...prev, [latestIdx]: 0 }));
    
    let lineCount = 0;
    const interval = setInterval(() => {
      lineCount += Math.floor(Math.random() * 3) + 1;
      if (lineCount >= totalLines) {
        lineCount = totalLines;
        clearInterval(interval);
      }
      setVisibleLines(prev => ({ ...prev, [latestIdx]: lineCount }));
    }, 80);

    return () => clearInterval(interval);
  }, [visibleFileCount, files]);

  // Mark all previous files as fully visible
  useEffect(() => {
    const newVisible: Record<number, number> = {};
    for (let i = 0; i < visibleFileCount - 1; i++) {
      if (files[i]) {
        newVisible[i] = files[i].code.split('\n').length;
      }
    }
    setVisibleLines(prev => ({ ...prev, ...newVisible }));
  }, [visibleFileCount, files]);

  const handleCopy = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      onCopyFile?.(code);
    } catch {
      // clipboard API not available
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleFile = (index: number) => {
    const newSet = new Set(expandedFiles);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedFiles(newSet);
  };

  // Auto-expand newly added file
  useEffect(() => {
    if (visibleFileCount > 0) {
      setExpandedFiles(prev => {
        const newSet = new Set(prev);
        newSet.add(visibleFileCount - 1);
        return newSet;
      });
    }
  }, [visibleFileCount]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-purple-400" />
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Flutter Code</span>
        </div>
        <span className="text-[10px] text-purple-400/60 bg-purple-400/10 px-2 py-0.5 rounded-full font-mono border border-purple-400/10">
          {visibleFiles.length} file{visibleFiles.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence>
          {visibleFiles.map((file, index) => {
            const lines = file.code.split('\n');
            const shownLineCount = visibleLines[index] ?? lines.length;
            const shownLines = lines.slice(0, shownLineCount);
            const isStreaming = shownLineCount < lines.length;
            const isExpanded = expandedFiles.has(index);
            const isLatest = index === visibleFileCount - 1 && currentStep < 9;

            return (
              <motion.div
                key={file.filename}
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`rounded-xl overflow-hidden transition-all ${
                  isLatest
                    ? 'border border-purple-500/20 shadow-sm shadow-purple-500/5'
                    : 'border border-white/5 hover:border-white/10'
                }`}
                style={{ background: '#0c0c14' }}
              >
                {/* File header */}
                <button
                  onClick={() => toggleFile(index)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left group"
                >
                  {isExpanded ? (
                    <ChevronDown size={11} className="text-white/25 group-hover:text-white/40 transition-colors" />
                  ) : (
                    <ChevronRight size={11} className="text-white/25 group-hover:text-white/40 transition-colors" />
                  )}
                  <FileCode size={12} className="text-purple-400/60" />
                  <span className="text-[11px] font-mono text-purple-300 font-medium flex-1">{file.filename}</span>
                  
                  {isStreaming && (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center gap-1 text-[9px] text-cyan-400/60"
                    >
                      <Sparkles size={9} />
                      writing...
                    </motion.div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(file.code, index); }}
                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors ml-1"
                    title="Copy file"
                  >
                    {copiedIndex === index ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} className="text-white/25 hover:text-white/50" />
                    )}
                  </button>
                </button>

                {/* Code content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 py-2 border-t border-white/5 overflow-x-auto max-h-[220px] overflow-y-auto">
                        <pre className="text-[10px] leading-[1.7] font-mono">
                          <code>
                            {shownLines.map((line, lineIdx) => (
                              <div key={lineIdx} className="flex hover:bg-white/[0.02] rounded-sm">
                                <span className="text-white/12 select-none w-7 text-right mr-3 inline-block flex-shrink-0 text-[9px]">
                                  {lineIdx + 1}
                                </span>
                                <span className="text-white/65">
                                  {highlightSyntax(line)}
                                </span>
                              </div>
                            ))}
                            {isStreaming && (
                              <motion.div
                                animate={{ opacity: [0.3, 0.8, 0.3] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="flex items-center gap-1 pl-10 mt-1"
                              >
                                <span className="text-cyan-400/40 text-[9px]">▌</span>
                              </motion.div>
                            )}
                          </code>
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Generating placeholder */}
        {currentStep >= 1 && currentStep < 9 && (
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-xl p-4 border border-white/5 bg-white/[0.01] text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={12} className="text-purple-400/40" />
              </motion.div>
              <p className="text-[10px] text-white/25 font-mono">Generating more files...</p>
            </div>
          </motion.div>
        )}

        {/* Complete state */}
        {currentStep >= 9 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-3 bg-gradient-to-r from-purple-500/8 to-cyan-500/5 border border-purple-500/15 text-center"
          >
            <p className="text-[10px] text-purple-300/70 font-medium">✨ All {files.length} files generated successfully</p>
            <p className="text-[9px] text-white/25 mt-0.5">Ready for deployment</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

function highlightSyntax(line: string): React.ReactNode {
  const keywords = ['import', 'class', 'extends', 'const', 'final', 'return', 'void', 'static', 'get', 'override', 'required', 'this', 'super', 'new', 'if', 'else', 'true', 'false'];
  const types = ['Widget', 'BuildContext', 'State', 'StatelessWidget', 'StatefulWidget', 'ThemeData', 'MaterialApp', 'Scaffold', 'Color', 'String', 'int', 'bool', 'double', 'EdgeInsets', 'BoxDecoration', 'BorderRadius', 'Text', 'Column', 'Row', 'Container', 'Icon', 'Icons'];

  if (line.trim().startsWith('import ') || line.trim().startsWith('//')) {
    return <span className="text-green-400/50">{line}</span>;
  }
  if (line.trim().startsWith('@')) {
    return <span className="text-yellow-400/60">{line}</span>;
  }

  if (line.includes("'")) {
    const parts = line.split(/('.*?')/);
    return (
      <>
        {parts.map((part, i) =>
          part.startsWith("'") && part.endsWith("'") ? (
            <span key={i} className="text-amber-300/60">{part}</span>
          ) : (
            <span key={i}>{colorizeTokens(part, keywords, types)}</span>
          )
        )}
      </>
    );
  }

  return colorizeTokens(line, keywords, types);
}

function colorizeTokens(text: string, keywords: string[], types: string[]): React.ReactNode {
  const tokens = text.split(/(\s+)/);
  return (
    <>
      {tokens.map((token, i) => {
        const cleanToken = token.replace(/[^a-zA-Z]/g, '');
        if (keywords.includes(cleanToken)) {
          return <span key={i} className="text-purple-400/70">{token}</span>;
        }
        if (types.includes(cleanToken)) {
          return <span key={i} className="text-cyan-400/70">{token}</span>;
        }
        if (/^\d+/.test(token.trim())) {
          return <span key={i} className="text-orange-400/60">{token}</span>;
        }
        return <span key={i}>{token}</span>;
      })}
    </>
  );
}

export default CodeViewer;
