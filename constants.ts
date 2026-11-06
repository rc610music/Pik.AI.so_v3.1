import { ArtStyle, ArtStyleOption, SignatureStyle, SignatureStyleOption, TypographyStyle, TypographyStyleOption, MonogramStyle, MonogramStyleOption, LogoStyle, LogoStyleOption, BrandStyle, BrandStyleOption } from './types';

export const ART_STYLE_OPTIONS: ArtStyleOption[] = Object.values(ArtStyle).map(style => ({
  value: style,
  label: style,
}));

export const DEFAULT_ART_STYLE: ArtStyle = ArtStyle.PHOTOREALISTIC;


export const SIGNATURE_STYLE_OPTIONS: SignatureStyleOption[] = Object.values(SignatureStyle).map(style => ({
    value: style,
    label: style,
}));

export const DEFAULT_SIGNATURE_STYLE: SignatureStyle = SignatureStyle.ELEGANT_SCRIPT;


export const TYPOGRAPHY_STYLE_OPTIONS: TypographyStyleOption[] = Object.values(TypographyStyle).map(style => ({
    value: style,
    label: style,
}));

export const DEFAULT_TYPOGRAPHY_STYLE: TypographyStyle = TypographyStyle.CHROME_3D;

export const MONOGRAM_STYLE_OPTIONS: MonogramStyleOption[] = Object.values(MonogramStyle).map(style => ({
    value: style,
    label: style,
}));

export const DEFAULT_MONOGRAM_STYLE: MonogramStyle = MonogramStyle.CLASSIC_SHIELD;

export const LOGO_STYLE_OPTIONS: LogoStyleOption[] = Object.values(LogoStyle).map(style => ({
    value: style,
    label: style,
}));

export const DEFAULT_LOGO_STYLE: LogoStyle = LogoStyle.ABSTRACT_MARK;

export const BRAND_STYLE_OPTIONS: BrandStyleOption[] = Object.values(BrandStyle).map(style => ({
    value: style,
    label: style,
}));

export const DEFAULT_BRAND_STYLE: BrandStyle = BrandStyle.TECH_MINIMAL;