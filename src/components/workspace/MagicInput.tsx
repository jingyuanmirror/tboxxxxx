'use client';

import { useState, useRef, useCallback } from 'react';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  type: string;
  isImage: boolean;
  previewUrl?: string;
}

const FILE_TYPE_ICONS: Record<string, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: '#e74c3c' },
  doc: { label: 'DOC', color: '#2b579a' },
  docx: { label: 'DOC', color: '#2b579a' },
  xls: { label: 'XLS', color: '#217346' },
  xlsx: { label: 'XLS', color: '#217346' },
  ppt: { label: 'PPT', color: '#d24726' },
  pptx: { label: 'PPT', color: '#d24726' },
  txt: { label: 'TXT', color: '#6b7280' },
  csv: { label: 'CSV', color: '#217346' },
  zip: { label: 'ZIP', color: '#f59e0b' },
  rar: { label: 'RAR', color: '#f59e0b' },
  mp4: { label: 'MP4', color: '#8b5cf6' },
  mp3: { label: 'MP3', color: '#ec4899' },
  default: { label: 'FILE', color: '#6b7280' },
};

const MODES = [
  { name: 'PPT 演示', iconKey: 'ppt', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  )},
  { name: 'Web 搜索', iconKey: 'web', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )},
  { name: 'Excel 分析', iconKey: 'excel', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )},
  { name: 'Code 生成', iconKey: 'code', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )},
  { name: 'Mail 撰写', iconKey: 'mail', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2.5 }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )},
  { 
    name: '小红书', 
    iconKey: 'xiaohongshu', 
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" style={{ strokeWidth: 2 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    isSpecial: true
  },
];

export default function MagicInput() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<typeof MODES[0] | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles: UploadedFile[] = Array.from(files).map((file) => {
      const isImage = isImageFile(file);
      const uploaded: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        name: file.name,
        type: getFileExtension(file.name),
        isImage,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      };
      return uploaded;
    });
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleModeSelect = (mode: typeof MODES[0]) => {
    // Toggle off if already selected
    if (selectedMode?.iconKey === mode.iconKey) {
      setSelectedMode(null);
    } else {
      setSelectedMode(mode);
    }
    setIsDropdownOpen(false);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log('Sending message:', inputValue);
      // Add your send logic here
      setInputValue('');
    }
  };

  return (
    <div 
      className="bg-[rgba(255,255,255,0.75)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.6)] w-full max-w-[950px] min-h-[170px] rounded-[24px] p-[15px_25px_20px_25px] box-border flex flex-col justify-between relative transition-all duration-300 ease-in-out flex-shrink-0 mb-[30px] hover:-translate-y-[3px] z-[2]"
      style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)';
      }}
    >
      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2.5 mb-1 border-b border-[rgba(0,0,0,0.06)]">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="group relative flex items-center gap-2 bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden transition-all hover:border-[rgba(0,0,0,0.12)]"
            >
              {file.isImage ? (
                /* Image preview */
                <div className="w-[72px] h-[72px] flex-shrink-0 relative">
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                /* File type badge + name */
                <div className="flex items-center gap-2 px-3 py-2">
                  <span
                    className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded leading-none flex-shrink-0"
                    style={{ backgroundColor: (FILE_TYPE_ICONS[file.type] || FILE_TYPE_ICONS.default).color }}
                  >
                    {(FILE_TYPE_ICONS[file.type] || FILE_TYPE_ICONS.default).label}
                  </span>
                  <span className="text-[12px] text-[#444] max-w-[120px] truncate" title={file.name}>
                    {file.name}
                  </span>
                </div>
              )}
              {/* Remove button */}
              <button
                onClick={() => handleRemoveFile(file.id)}
                className="absolute top-1 right-1 w-4 h-4 bg-[rgba(0,0,0,0.5)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full border-none bg-transparent font-['Inter'] text-base leading-normal text-[#1d1d1f] resize-none outline-none flex-1 mb-1.5 pt-0 placeholder:text-[#a1a1a6] placeholder:font-normal"
        placeholder="请直接吩咐任务：例如，将芯片报告初稿转化为高管演示 PPT..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      {/* Input Tools */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          {/* Upload Button */}
          <label
            className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer text-[#86868b] hover:text-[#1d1d1f] hover:border-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.04)] transition-all relative -top-[3px]"
            title="上传文件"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFileUpload(e.target.files);
                e.target.value = '';
              }}
            />
          </label>

          {/* Mode Dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-[12px] py-1.5 rounded-[10px] text-[13px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors relative -top-[3px] text-[#555] hover:bg-[rgba(0,0,0,0.06)]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ strokeWidth: 2 }}>
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
                <line x1="4" y1="8" x2="8" y2="8" />
                <line x1="4" y1="16" x2="8" y2="16" />
                <line x1="16" y1="8" x2="20" y2="8" />
                <line x1="16" y1="16" x2="20" y2="16" />
              </svg>
            </button>

            {/* Dropdown Menu - opens upward */}
            {isDropdownOpen && (
              <div 
                className="absolute bottom-full left-0 min-w-[160px] bg-white rounded-xl mb-1 overflow-hidden z-50"
                style={{ 
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                  padding: '8px 0'
                }}
              >
                {MODES.map((mode) => (
                  <div
                    key={mode.iconKey}
                    onClick={() => handleModeSelect(mode)}
                    className={`flex items-center px-[15px] py-2 text-sm cursor-pointer transition-colors font-medium gap-2.5 ${
                      selectedMode?.iconKey === mode.iconKey 
                        ? 'bg-[rgba(0,0,0,0.04)] font-semibold text-[#1d1d1f]' 
                        : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <span 
                      className={`w-4 h-4 flex-shrink-0 flex items-center justify-center ${
                        mode.isSpecial 
                          ? 'bg-[#FF2D55] rounded-full' 
                          : ''
                      } ${
                        mode.isSpecial ? 'text-white' : 'text-[#6a6e73]'
                      }`}
                    >
                      {mode.icon && mode.icon()}
                    </span>
                    {mode.name}{mode.isSpecial ? ' ' : ''}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Mode Chip */}
          {selectedMode && (
            <div className="flex items-center gap-1.5 relative -top-[3px] text-[#1a73e8]">
              <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-[#1a73e8]">
                {selectedMode.icon && selectedMode.icon()}
              </span>
              <span className="text-[13px] font-medium">{selectedMode.name}</span>
              <button
                onClick={() => setSelectedMode(null)}
                className="w-4 h-4 flex items-center justify-center text-[#1a73e8] hover:text-[#174ea6] cursor-pointer transition-colors ml-0.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          className="w-8 h-8 bg-[#1d1d1f] rounded-full flex justify-center items-center text-white cursor-pointer transition-all hover:scale-110 hover:bg-black"
          style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
