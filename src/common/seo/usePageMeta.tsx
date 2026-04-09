import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { clearSchemas, injectSchema } from './schema';

export interface PageMetaProps {
	title: string;
	description: string;
	keywords?: string;
	ogImage?: string;
	ogUrl?: string;
	canonical?: string;
	schema?: Record<string, unknown>;
}

export function usePageMeta({
	title,
	description,
	keywords = 'UCSC, UC Santa Cruz',
	ogImage = 'https://ucsc.app/favicon.ico',
	ogUrl = 'https://ucsc.app',
	canonical = 'https://ucsc.app',
	schema,
}: PageMetaProps) {
	// Inject JSON-LD schema when page meta changes
	useEffect(() => {
		if (schema) {
			clearSchemas();
			injectSchema(schema);
		}
	}, [schema]);

	return (
		<Helmet>
			<title>{title} | UCSC.app</title>
			<meta name="title" content={`${title} | UCSC.app`} />
			<meta name="description" content={description} />
			<meta name="keywords" content={keywords} />

			{/* Open Graph */}
			<meta property="og:type" content="website" />
			<meta property="og:url" content={ogUrl} />
			<meta property="og:title" content={`${title} | UCSC.app`} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={ogImage} />
			<meta property="og:site_name" content="UCSC.app" />

			{/* Twitter */}
			<meta property="twitter:card" content="summary_large_image" />
			<meta property="twitter:url" content={ogUrl} />
			<meta property="twitter:title" content={`${title} | UCSC.app`} />
			<meta property="twitter:description" content={description} />
			<meta property="twitter:image" content={ogImage} />

			{/* Canonical */}
			<link rel="canonical" href={canonical} />
		</Helmet>
	);
}
