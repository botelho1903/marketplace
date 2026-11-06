'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Globe, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface LogoUploadWithBgProps {
  /** Current site name */
  currentSiteName?: string
  /** Current logo URL */
  currentLogo?: string
  /** Current background/wallpaper URL */
  currentBackground?: string
  /** Current favicon URL */
  currentFavicon?: string
  /** Callback when site name changes */
  onSiteNameChange?: (name: string) => void
  /** Callback when logo changes */
  onLogoChange?: (logoUrl: string) => void
  /** Callback when background changes */
  onBackgroundChange?: (bgUrl: string) => void
  /** Callback when favicon changes */
  onFaviconChange?: (faviconUrl: string) => void
  /** Site ID for API calls */
  siteId?: string
  /** Whether the component is in a loading state */
  isLoading?: boolean
  /** Custom className */
  className?: string
  /** Preview aspect ratio (width/height) */
  previewAspectRatio?: number
  /** Show background upload option */
  showBackgroundUpload?: boolean
  /** Show favicon upload option */
  showFaviconUpload?: boolean
  /** Maximum file size in MB */
  maxFileSize?: number
  /** Allowed file types */
  allowedTypes?: string[]
}

const DEFAULT_ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
const DEFAULT_MAX_FILE_SIZE = 5 // MB

type UploadType = 'logo' | 'background' | 'favicon'

export function LogoUploadWithBg({
  currentSiteName = '',
  currentLogo,
  currentBackground,
  currentFavicon,
  onSiteNameChange,
  onLogoChange,
  onBackgroundChange,
  onFaviconChange,
  siteId,
  isLoading = false,
  className,
  previewAspectRatio = 16 / 9,
  showBackgroundUpload = true,
  showFaviconUpload = true,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
}: LogoUploadWithBgProps) {
  const [siteName, setSiteName] = useState(currentSiteName)
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogo || null)
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(currentBackground || null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(currentFavicon || null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [bgUploading, setBgUploading] = useState(false)
  const [faviconUploading, setFaviconUploading] = useState(false)
  const [dragActive, setDragActive] = useState<UploadType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgFileInputRef = useRef<HTMLInputElement>(null)
  const faviconFileInputRef = useRef<HTMLInputElement>(null)

  // Update local state when props change
  if (currentSiteName !== siteName) setSiteName(currentSiteName)
  if (currentLogo !== logoPreview && !logoUploading) setLogoPreview(currentLogo || null)
  if (currentBackground !== backgroundPreview && !bgUploading) setBackgroundPreview(currentBackground || null)
  if (currentFavicon !== faviconPreview && !faviconUploading) setFaviconPreview(currentFavicon || null)

  const validateFile = useCallback((file: File): boolean => {
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de arquivo não suportado. Use: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`)
      return false
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxFileSize}MB`)
      return false
    }
    setError(null)
    return true
  }, [allowedTypes, maxFileSize])

  const uploadFile = useCallback(async (file: File, type: UploadType): Promise<string | null> => {
    if (!siteId) {
      setError('Site ID não informado')
      return null
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('siteId', siteId)

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Erro no upload')
      }

      const data = await response.json()
      return data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload')
      return null
    }
  }, [siteId])

  const handleFileSelect = async (file: File, type: UploadType) => {
    if (!validateFile(file)) return

    const setUploading = type === 'logo' ? setLogoUploading : type === 'background' ? setBgUploading : setFaviconUploading
    const setPreview = type === 'logo' ? setLogoPreview : type === 'background' ? setBackgroundPreview : setFaviconPreview
    const onChange = type === 'logo' ? onLogoChange : type === 'background' ? onBackgroundChange : onFaviconChange
    const current = type === 'logo' ? currentLogo : type === 'background' ? currentBackground : currentFavicon

    setUploading(true)
    setError(null)

    // Create preview immediately
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    // Upload to server
    const url = await uploadFile(file, type)
    if (url) {
      setPreview(url)
      onChange?.(url)
    } else {
      // Revert to original on failure
      setPreview(current || null)
    }
    setUploading(false)
  }

  const handleDragOver = (e: React.DragEvent, type: UploadType) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(type)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)
  }

  const handleDrop = (e: React.DragEvent, type: UploadType) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file, type)
    }
  }

  const removeFile = (type: UploadType) => {
    if (type === 'logo') {
      setLogoPreview(null)
      onLogoChange?.('')
    } else if (type === 'background') {
      setBackgroundPreview(null)
      onBackgroundChange?.('')
    } else {
      setFaviconPreview(null)
      onFaviconChange?.('')
    }
  }

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click()
  }

  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSiteName(value)
    onSiteNameChange?.(value)
  }

  const UploadSection = ({
    type,
    label,
    icon: Icon,
    current,
    preview,
    uploading,
    onRemove,
    onSelect,
    dragActiveType,
    showRemove,
    accept = allowedTypes.join(','),
    placeholder,
    tip,
    ref,
  }: {
    type: UploadType
    label: string
    icon: React.ComponentType<{ className?: string }>
    current?: string
    preview: string | null
    uploading: boolean
    onRemove: () => void
    onSelect: () => void
    dragActiveType: UploadType | null
    showRemove: boolean
    accept?: string
    placeholder?: React.ReactNode
    tip?: string
    ref: React.RefObject<HTMLInputElement>
  }) => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {label}
          </CardTitle>
          {showRemove && preview && !uploading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" /> Remover
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          <div
            className={cn(
              'relative rounded-lg overflow-hidden border-2 transition-colors',
              dragActiveType === type ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'
            )}
            style={{
              aspectRatio: previewAspectRatio,
              backgroundImage: backgroundPreview && type !== 'background' ? `url(${backgroundPreview})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            onDragOver={(e) => handleDragOver(e, type)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, type)}
          >
            {/* Background overlay for better logo/favicon visibility */}
            {backgroundPreview && type !== 'background' && (
              <div className="absolute inset-0 bg-black/10 dark:bg-white/5" />
            )}

            {/* Preview Content */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm">Enviando {label.toLowerCase()}...</span>
                </div>
              ) : preview ? (
                type === 'favicon' ? (
                  <div className="relative w-32 h-32 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                    <img
                      src={preview}
                      alt="Preview do favicon"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                ) : (
                  <img
                    src={preview}
                    alt={`Preview do ${label.toLowerCase()}`}
                    className={cn(
                      'max-w-full max-h-full object-contain drop-shadow-lg transition-all duration-300',
                      backgroundPreview && type !== 'background'
                        ? 'filter brightness-110 contrast-105'
                        : ''
                    )}
                    style={{ maxWidth: '80%', maxHeight: '80%' }}
                  />
                )
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400 p-8 text-center">
                  <Upload className="h-12 w-12 opacity-50" />
                  {placeholder || (
                    <>
                      <span className="text-sm">Arraste {label.toLowerCase()} aqui ou clique para selecionar</span>
                      <span className="text-xs opacity-60">{tip || `PNG, JPG, WebP, SVG • Máx. ${maxFileSize}MB`}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Upload indicator overlay */}
            {(dragActiveType === type || uploading) && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    'Solte para fazer upload'
                  )}
                </div>
              </div>
            )}
          </div>

          <input
            ref={ref}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], type)}
          />

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={onSelect}
              disabled={uploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Enviando...' : `Selecionar ${label}`}
            </Button>
            {current && !preview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (type === 'logo') setLogoPreview(current)
                  else if (type === 'background') setBackgroundPreview(current)
                  else setFaviconPreview(current)
                }}
              >
                Restaurar Original
              </Button>
            )}
          </div>

          {error && (
            <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Site Name Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Nome do Site
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Label htmlFor="site-name" className="text-sm font-medium">
              Nome que aparecerá no site (ex: nome da loja do vendedor)
            </Label>
            <Input
              id="site-name"
              value={siteName}
              onChange={handleSiteNameChange}
              placeholder="Ex: Loja do João, Minha Loja Virtual, etc."
              className="text-lg"
              maxLength={100}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Este nome será exibido no cabeçalho, título do navegador e comunicações do site.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logo Section */}
      <UploadSection
        type="logo"
        label="Logo do Site"
        icon={ImageIcon}
        current={currentLogo}
        preview={logoPreview}
        uploading={logoUploading}
        onRemove={() => removeFile('logo')}
        onSelect={() => triggerFileInput(fileInputRef)}
        dragActiveType={dragActive}
        showRemove={!!logoPreview}
        ref={fileInputRef}
        tip="Recomendado: fundo transparente, proporção 1:1 ou 4:1 • PNG, SVG preferidos"
      />

      {/* Background/Wallpaper Section */}
      {showBackgroundUpload && (
        <UploadSection
          type="background"
          label="Papel de Parede / Background"
          icon={FileImage}
          current={currentBackground}
          preview={backgroundPreview}
          uploading={bgUploading}
          onRemove={() => removeFile('background')}
          onSelect={() => triggerFileInput(bgFileInputRef)}
          dragActiveType={dragActive}
          showRemove={!!backgroundPreview}
          ref={bgFileInputRef}
          tip="Recomendado: 1920x1080 ou superior • A logo ficará sobre este background com leve overlay para legibilidade"
        />
      )}

      {/* Favicon Section */}
      {showFaviconUpload && (
        <UploadSection
          type="favicon"
          label="Favicon (Ícone do Navegador)"
          icon={Globe}
          current={currentFavicon}
          preview={faviconPreview}
          uploading={faviconUploading}
          onRemove={() => removeFile('favicon')}
          onSelect={() => triggerFileInput(faviconFileInputRef)}
          dragActiveType={dragActive}
          showRemove={!!faviconPreview}
          ref={faviconFileInputRef}
          accept="image/png,image/svg+xml,image/x-icon"
          tip="Recomendado: 32x32 ou 16x16 • PNG ou SVG • Fundo transparente"
          placeholder={(
            <>
              <span className="text-sm">Arraste o favicon aqui ou clique</span>
              <span className="text-xs opacity-60">PNG, SVG, ICO • 32x32px • Máx. {maxFileSize}MB</span>
            </>
          )}
        />
      )}

      {/* Combined Preview - How it looks together */}
      {(logoPreview || backgroundPreview || faviconPreview) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Preview do Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Browser tab preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {faviconPreview && (
                  <img src={faviconPreview} alt="Favicon" className="w-5 h-5 rounded" />
                )}
                <span className="font-medium text-sm">{siteName || currentSiteName || 'Nome do Site'}</span>
                <span className="text-gray-400 text-xs">- aba do navegador</span>
              </div>

              {/* Header preview with background */}
              <div
                className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                style={{
                  aspectRatio: previewAspectRatio,
                  backgroundImage: backgroundPreview ? `url(${backgroundPreview})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  {backgroundPreview && (
                    <div className="absolute inset-0 bg-black/10 dark:bg-white/5" />
                  )}
                  <div className="relative flex items-center justify-between w-full max-w-6xl mx-auto px-4">
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo no header"
                        className="h-12 w-auto object-contain drop-shadow-xl"
                      />
                    )}
                    {!logoPreview && siteName && (
                      <span className="text-xl font-bold text-white drop-shadow-xl">{siteName}</span>
                    )}
                    <div className="flex items-center gap-4 text-white/80 text-sm">
                      <span>Início</span>
                      <span>Produtos</span>
                      <span>Categorias</span>
                      <span>Contato</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                A logo fica sobre o background com um leve overlay escuro para garantir legibilidade.
                O nome do site aparece na aba do navegador e pode ser usado no header se não houver logo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper hook for using the component with form state
export function useLogoUpload(siteId: string) {
  const [siteName, setSiteName] = useState('')
  const [logo, setLogo] = useState('')
  const [background, setBackground] = useState('')
  const [favicon, setFavicon] = useState('')

  const handleSiteNameChange = useCallback((name: string) => {
    setSiteName(name)
  }, [])

  const handleLogoChange = useCallback((url: string) => {
    setLogo(url)
  }, [])

  const handleBackgroundChange = useCallback((url: string) => {
    setBackground(url)
  }, [])

  const handleFaviconChange = useCallback((url: string) => {
    setFavicon(url)
  }, [])

  return {
    siteName,
    logo,
    background,
    favicon,
    setSiteName,
    setLogo,
    setBackground,
    setFavicon,
    handleSiteNameChange,
    handleLogoChange,
    handleBackgroundChange,
    handleFaviconChange,
    reset: () => {
      setSiteName('')
      setLogo('')
      setBackground('')
      setFavicon('')
    },
  }
}