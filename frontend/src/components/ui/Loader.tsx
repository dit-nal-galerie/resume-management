import React from 'react';
import { useTranslation } from 'react-i18next';

type LoaderVariant = 'spinner' | 'dots';
type LoaderSize = 'sm' | 'md' | 'lg';

export type LoaderProps = {
    /** i18n-Key für das Label (Default: 'common.loading') */
    labelKey?: string;
    /** Falls du ausnahmsweise einen freien Text erzwingen willst */
    label?: string;
    /** Darstellungsvariante */
    variant?: LoaderVariant;
    /** Größe des Loaders */
    size?: LoaderSize;
    /** Abdunkelung/Overlay um den Loader herum (positioniert relativ zum nächsten positioned parent) */
    overlay?: boolean;
    /** Zentriert den Loader im gesamten Viewport mit Overlay */
    fullscreen?: boolean;
    /** Zusätzliche Klassen für den äußeren Wrapper */
    className?: string;
    /** Label-Position: 'right' (Default) oder 'bottom' */
    labelPosition?: 'right' | 'bottom';
    /** ARIA-Live-Region-Modus */
    ariaLive?: 'polite' | 'assertive';
};

const sizeMap: Record<LoaderSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
};

const gapMap: Record<LoaderSize, string> = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
};

export default function Loader({
    labelKey = 'common.loading',
    label,
    variant = 'spinner',
    size = 'md',
    overlay = false,
    fullscreen = false,
    className = '',
    labelPosition = 'right',
    ariaLive = 'polite',
}: LoaderProps) {
    const { t } = useTranslation();

    const labelText = label ?? t(labelKey);
    const srOnlyText = t('common.loading');

    const content = (
        <div
            role="status"

            aria-busy="true"
            className={[
                'flex items-center',
                labelPosition === 'bottom' ? 'flex-col' : 'flex-row',
                gapMap[size],
                className,
            ].join(' ')}
        >
            {variant === 'spinner' ? <Spinner size={size} /> : <Dots size={size} />}

            {labelText ? <span className="text-sm text-gray-600">{labelText}</span> : null}

            <span className="sr-only">{srOnlyText}</span>
        </div>
    );

    if (fullscreen) {
        return (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
                {content}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/20">
                {content}
            </div>
        );
    }

    return content;
}

/* ===================== Helper Subcomponents ===================== */

function Spinner({ size }: { size: LoaderSize }) {
    const dim = sizeMap[size];
    return (
        <svg className={['animate-spin text-gray-600', dim].join(' ')} viewBox="0 0 24 24" aria-hidden="true">
            {/* Track */}
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            {/* Arc */}
            <path className="opacity-90" d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
    );
}

function Dots({ size }: { size: LoaderSize }) {
    const dotSize =
        size === 'sm' ? 'h-1.5 w-1.5' :
            size === 'lg' ? 'h-2.5 w-2.5' :
                'h-2 w-2';

    const base = `mx-0.5 inline-block rounded-full bg-gray-600 animate-bounce ${dotSize}`;

    return (
        <div className="flex items-center">
            <span className={`${base} animate-delay-0`} />
            <span className={`${base} animate-delay-120`} />
            <span className={`${base} animate-delay-240`} />
        </div>
    );
}
/* ===================== Presets (optional) ===================== */

export function PageLoader({ labelKey = 'common.loading' }: { labelKey?: string }) {
    return <Loader fullscreen labelKey={labelKey} size="lg" variant="spinner" labelPosition="bottom" />;
}

export function InlineLoader({ labelKey = 'common.loading' }: { labelKey?: string }) {
    return <Loader labelKey={labelKey} size="sm" variant="dots" />;
}
