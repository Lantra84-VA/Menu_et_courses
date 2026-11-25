import React, { useCallback, useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Check,
  Download,
  FileJson,
  FolderSync,
  Loader2,
  LogOut,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AppData } from '../types';
import {
  DriveBackupFile,
  createDriveBackup,
  deleteDriveBackup,
  downloadDriveBackup,
  getAccessToken,
  googleSignIn,
  listDriveBackups,
  logout,
  updateDriveBackup,
} from '../utils/googleDrive';

interface BackupModalProps {
  isOpen: boolean;
  initialMode: 'export' | 'import';
  user: User | null;
  needsAuth: boolean;
  data: AppData;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  onLoggedOut: () => void;
  onExportLocal: () => void;
  onImportLocalFile: (file: File) => void;
  onRestoreData: (restored: AppData, message: string) => void;
  onNotify: (text: string, type?: 'success' | 'error') => void;
}

type PendingAction =
  | { type: 'overwrite'; file: DriveBackupFile }
  | { type: 'delete'; file: DriveBackupFile }
  | { type: 'restore'; file: DriveBackupFile }
  | null;

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  initialMode,
  user,
  needsAuth,
  data,
  onClose,
  onAuthSuccess,
  onLoggedOut,
  onExportLocal,
  onImportLocalFile,
  onRestoreData,
  onNotify,
}) => {
  const [mode, setMode] = useState<'export' | 'import'>(initialMode);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveBackupFile[]>([]);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isConnected = Boolean(user && !needsAuth && getAccessToken());

  const loadFiles = useCallback(async () => {
    if (!getAccessToken()) return;
    setIsLoadingFiles(true);
    setDriveError(null);
    try {
      const files = await listDriveBackups();
      setDriveFiles(files);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'AUTH_REQUIRED' || msg === 'AUTH_EXPIRED') {
        onLoggedOut();
      } else {
        setDriveError('Impossible de charger la liste des sauvegardes Google Drive.');
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, [onLoggedOut]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setPendingAction(null);
      setDriveError(null);
      if (getAccessToken()) {
        void loadFiles();
      }
    }
  }, [isOpen, initialMode, loadFiles]);

  if (!isOpen) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setDriveError(null);
    try {
      const result = await googleSignIn();
      onAuthSuccess(result.user);
      await loadFiles();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connexion annulée.';
      if (!msg.includes('popup-closed-by-user')) {
        setDriveError('La connexion Google a échoué. Veuillez réessayer.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setDriveFiles([]);
    setPendingAction(null);
    onLoggedOut();
  };

  const handleCreateNewDriveBackup = async () => {
    setIsBusy(true);
    setDriveError(null);
    try {
      const created = await createDriveBackup(data);
      await loadFiles();
      onNotify(`Sauvegarde "${created.name}" enregistrée dans Google Drive !`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'AUTH_REQUIRED' || msg === 'AUTH_EXPIRED') {
        onLoggedOut();
      } else {
        setDriveError("Impossible d'envoyer le fichier vers Google Drive.");
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmPending = async () => {
    if (!pendingAction) return;
    setIsBusy(true);
    setDriveError(null);

    try {
      if (pendingAction.type === 'overwrite') {
        const updated = await updateDriveBackup(pendingAction.file.id, data);
        await loadFiles();
        onNotify(`Fichier "${updated.name}" mis à jour dans Google Drive !`);
      } else if (pendingAction.type === 'delete') {
        await deleteDriveBackup(pendingAction.file.id);
        await loadFiles();
        onNotify(`Fichier "${pendingAction.file.name}" supprimé de Google Drive.`);
      } else if (pendingAction.type === 'restore') {
        const restored = await downloadDriveBackup(pendingAction.file.id);
        onRestoreData(restored, `Sauvegarde "${pendingAction.file.name}" importée depuis Google Drive !`);
        onClose();
      }
      setPendingAction(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'AUTH_REQUIRED' || msg === 'AUTH_EXPIRED') {
        onLoggedOut();
      } else {
        setDriveError("L'opération sur Google Drive a échoué.");
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportLocalFile(file);
      onClose();
    }
    e.target.value = '';
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-stone-950/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl border border-stone-200 shadow-xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-stone-300" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-3 border-b border-stone-100 flex items-center justify-between gap-3 shrink-0">
          <div>
            <h2 id="backup-modal-title" className="font-display text-lg font-bold text-stone-900">
              Sauvegarde Google Drive & .JSON
            </h2>
            <p className="text-xs text-stone-500">
              Exportez ou restaurez vos menus, plats et courses
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch */}
        <div className="px-5 pt-3 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('export');
                setPendingAction(null);
              }}
              className={`min-h-[40px] text-sm font-semibold rounded-lg transition-colors ${
                mode === 'export'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Exporter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('import');
                setPendingAction(null);
              }}
              className={`min-h-[40px] text-sm font-semibold rounded-lg transition-colors ${
                mode === 'import'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Importer
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Google Drive Section */}
          <div className="border border-stone-200 rounded-2xl p-4 space-y-4 bg-stone-50/50">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold text-stone-900">
                  Google Drive
                </h3>
                <p className="text-xs text-stone-500 truncate">
                  {isConnected
                    ? user?.email || user?.displayName || 'Compte Google connecté'
                    : 'Connectez votre compte Google pour sauvegarder dans Drive'}
                </p>
              </div>
              {isConnected && (
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Se déconnecter"
                  className="min-h-[36px] px-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Déconnexion</span>
                </button>
              )}
            </div>

            {driveError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
                {driveError}
              </div>
            )}

            {/* Explicit Confirmation Dialog for Mutating / Destructive Drive Actions */}
            {pendingAction && (
              <div
                role="alertdialog"
                aria-labelledby="drive-confirm-title"
                className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3"
              >
                <p id="drive-confirm-title" className="text-sm font-semibold text-stone-900">
                  {pendingAction.type === 'overwrite' &&
                    `Remplacer le fichier « ${pendingAction.file.name} » dans Google Drive par vos données actuelles ?`}
                  {pendingAction.type === 'delete' &&
                    `Supprimer définitivement « ${pendingAction.file.name} » de votre Google Drive ?`}
                  {pendingAction.type === 'restore' &&
                    `Importer « ${pendingAction.file.name} » depuis Google Drive ? Vos données actuelles sur cet appareil seront remplacées.`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleConfirmPending}
                    className={`min-h-[40px] px-4 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                      pendingAction.type === 'delete'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Confirmer</span>
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setPendingAction(null)}
                    className="min-h-[40px] px-4 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {!isConnected ? (
              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoggingIn}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-state" />
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isLoggingIn ? 'Connexion en cours...' : 'Se connecter avec Google'}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {mode === 'export' && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleCreateNewDriveBackup}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {isBusy && !pendingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FolderSync className="w-4 h-4" />
                    )}
                    <span>Exporter un nouveau fichier .JSON sur Drive</span>
                  </button>
                )}

                {/* Existing Drive Backups List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600">
                      Fichiers enregistrés sur votre Drive
                    </span>
                    <button
                      type="button"
                      onClick={() => void loadFiles()}
                      disabled={isLoadingFiles}
                      aria-label="Actualiser les fichiers Google Drive"
                      className="min-h-[32px] px-2 rounded-lg text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                      <span>Actualiser</span>
                    </button>
                  </div>

                  {isLoadingFiles && driveFiles.length === 0 ? (
                    <div className="py-4 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Chargement de vos sauvegardes Drive...</span>
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <p className="text-xs text-stone-500 bg-white border border-stone-200 rounded-xl p-3 text-center">
                      Aucune sauvegarde créée par cette application sur votre Drive pour l'instant.
                    </p>
                  ) : (
                    <ul className="divide-y divide-stone-100 bg-white border border-stone-200 rounded-xl overflow-hidden">
                      {driveFiles.map((file) => (
                        <li
                          key={file.id}
                          className="px-3 py-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex items-center gap-2.5">
                            <FileJson className="w-4 h-4 text-emerald-700 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-stone-900 truncate">
                                {file.name}
                              </div>
                              {file.modifiedTime && (
                                <div className="text-[11px] text-stone-500 tabular-nums">
                                  {formatDate(file.modifiedTime)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {mode === 'export' ? (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setPendingAction({ type: 'overwrite', file })}
                                className="min-h-[36px] px-2.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 text-xs font-semibold transition-colors"
                              >
                                Mettre à jour
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setPendingAction({ type: 'restore', file })}
                                className="min-h-[36px] px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                              >
                                Importer
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setPendingAction({ type: 'delete', file })}
                              aria-label={`Supprimer ${file.name}`}
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Local Device Fallback Section */}
          <div className="border-t border-stone-100 pt-4 space-y-2.5">
            <span className="block text-xs font-semibold text-stone-500">
              Ou sur cet appareil
            </span>
            {mode === 'export' ? (
              <button
                type="button"
                onClick={() => {
                  onExportLocal();
                  onClose();
                }}
                className="w-full min-h-[44px] px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le fichier .JSON sur l'appareil</span>
              </button>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleLocalFileChange}
                  className="sr-only"
                  aria-label="Choisir un fichier de sauvegarde JSON local"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[44px] px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importer un fichier .JSON depuis l'appareil</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
