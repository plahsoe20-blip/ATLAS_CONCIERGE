import React, { useState } from 'react';
import { Image as ImageIcon, Wand2, Download, AlertCircle, Sparkles } from 'lucide-react';
import { Button, Input, Card } from './ui';
import { generateConciergeImage, editConciergeImage } from '../services/geminiService';
import { ASPECT_RATIOS } from '../constants';

type Mode = 'GENERATE' | 'EDIT';

export const MediaStudio: React.FC = () => {
  const [mode, setMode] = useState<Mode>('GENERATE');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle File Upload for Editing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMode('EDIT'); // Auto switch to edit mode
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');

    try {
      if (mode === 'GENERATE') {
        const result = await generateConciergeImage(prompt, aspectRatio);
        if (result) setImage(result);
        else throw new Error("No image returned");
      } else {
        if (!image) return;
        // Nano Banana Editing
        const result = await editConciergeImage(image, prompt);
        if (result) setImage(result);
        else throw new Error("Editing failed");
      }
    } catch (err) {
      setError('Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-4">
            <button 
              onClick={() => setMode('GENERATE')}
              className={`text-sm font-medium pb-1 transition-colors ${mode === 'GENERATE' ? 'text-gold-500' : 'text-zinc-500 hover:text-white'}`}
            >
              Generate New
            </button>
            <button 
              onClick={() => setMode('EDIT')}
              className={`text-sm font-medium pb-1 transition-colors ${mode === 'EDIT' ? 'text-gold-500' : 'text-zinc-500 hover:text-white'}`}
            >
              Edit Image
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'GENERATE' && (
               <div>
                 <label className="text-xs font-medium text-zinc-400 uppercase mb-2 block">Aspect Ratio</label>
                 <div className="grid grid-cols-3 gap-2">
                   {ASPECT_RATIOS.map(ratio => (
                     <button
                       key={ratio}
                       onClick={() => setAspectRatio(ratio)}
                       className={`text-xs py-1 px-2 rounded border ${
                         aspectRatio === ratio 
                           ? 'bg-gold-500/20 border-gold-500 text-gold-500' 
                           : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                       }`}
                     >
                       {ratio}
                     </button>
                   ))}
                 </div>
               </div>
            )}

            {mode === 'EDIT' && (
               <div className="space-y-2">
                 <label className="text-xs font-medium text-zinc-400 uppercase">Source Image</label>
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={handleFileUpload}
                   className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-gold-500 hover:file:bg-zinc-700"
                 />
               </div>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase mb-2 block">
                {mode === 'GENERATE' ? 'Prompt' : 'Edit Instruction (Nano Banana)'}
              </label>
              <textarea 
                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-gold-500 focus:outline-none min-h-[100px]"
                placeholder={mode === 'GENERATE' ? "A luxury black SUV in front of a modern hotel..." : "Add a sunset filter, remove background..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <Button 
              variant="primary" 
              className="w-full" 
              onClick={handleAction}
              disabled={loading || (mode === 'EDIT' && !image)}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 animate-spin" /> Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> {mode === 'GENERATE' ? 'Generate' : 'Apply Edit'}
                </span>
              )}
            </Button>
            
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/10 p-2 rounded">
                <AlertCircle className="w-3 h-3" /> {error}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full min-h-[500px] flex items-center justify-center bg-zinc-900/30">
          {image ? (
            <div className="relative group">
              <img src={image} alt="Result" className="max-h-[600px] rounded-lg shadow-2xl" />
              <a 
                href={image} 
                download={`atlas-media-${Date.now()}.png`}
                className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold-500"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          ) : (
            <div className="text-center text-zinc-600">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Preview will appear here</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};