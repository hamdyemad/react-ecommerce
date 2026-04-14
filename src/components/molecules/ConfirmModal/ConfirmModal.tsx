import { tokens } from '../../../tokens';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Button } from '../../atoms/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  loading = false
}: ConfirmModalProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const icon = variant === 'danger' ? '🗑️' : variant === 'warning' ? '⚠️' : 'ℹ️';
  const accentColor = variant === 'danger' ? tokens.colors[mode].error.DEFAULT : tokens.colors[mode].primary.DEFAULT;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div 
        className="w-full max-w-md rounded-[40px] p-8 relative shadow-2xl animate-in zoom-in-95 duration-300 text-center"
        style={{ background: tokens.colors[mode].surface.elevated }}
      >
        <div 
          className="w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl transform hover:rotate-12 transition-transform"
          style={{ 
            background: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            color: accentColor
          }}
        >
          {icon}
        </div>

        <h3 
          className="text-2xl font-black mb-4"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          {title}
        </h3>
        
        <p 
          className="text-lg font-bold opacity-70 mb-10 leading-relaxed"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            type="button" 
            className="flex-1 px-8 py-4 rounded-2xl font-black text-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            style={{ color: tokens.colors[mode].text.tertiary }}
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel || t('common:cancel')}
          </button>
          <Button 
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            size="lg"
            className="flex-1 rounded-2xl font-black text-lg py-4 shadow-xl hover:scale-[1.05] active:scale-95 transition-all"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel || t('common:confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
