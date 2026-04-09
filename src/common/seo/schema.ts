/**
 * JSON-LD Schema.org structured data generators for SEO
 */

export interface SchemaProps {
	title?: string;
	description?: string;
	url?: string;
	image?: string;
}

/**
 * Generate Organization schema for UCSC.app
 */
export function generateOrganizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'EducationalOrganization',
		'name': 'UCSC.app',
		'description': 'All-in-one student platform for UC Santa Cruz',
		'url': 'https://ucsc.app',
		'image': 'https://ucsc.app/favicon.ico',
		'sameAs': [
			'https://www.ucsc.edu'
		],
		'parentOrganization': {
			'@type': 'EducationalOrganization',
			'name': 'University of California, Santa Cruz',
			'url': 'https://www.ucsc.edu'
		}
	};
}

/**
 * Generate WebSite schema with SearchAction
 */
export function generateWebsiteSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'name': 'UCSC.app',
		'description': 'Your all-in-one student platform for UC Santa Cruz',
		'url': 'https://ucsc.app',
		'potentialAction': {
			'@type': 'SearchAction',
			'target': {
				'@type': 'EntryPoint',
				'urlTemplate': 'https://ucsc.app/courses?search={search_term_string}'
			},
			'query-input': 'required name=search_term_string'
		}
	};
}

/**
 * Generate Course schema
 */
export function generateCourseSchema(title: string, description: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Course',
		'name': title,
		'description': description,
		'provider': {
			'@type': 'EducationalOrganization',
			'name': 'University of California, Santa Cruz',
			'url': 'https://www.ucsc.edu'
		},
		'url': 'https://ucsc.app/courses'
	};
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		'itemListElement': items.map((item, index) => ({
			'@type': 'ListItem',
			'position': index + 1,
			'name': item.name,
			'item': item.url
		}))
	};
}

/**
 * Generate NewsArticle schema
 */
export function generateNewsArticleSchema(
	headline: string,
	description: string,
	datePublished: string,
	image?: string
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'NewsArticle',
		'headline': headline,
		'description': description,
		'datePublished': datePublished,
		'image': image || 'https://ucsc.app/favicon.ico',
		'author': {
			'@type': 'Organization',
			'name': 'UC Santa Cruz',
			'url': 'https://www.ucsc.edu'
		},
		'publisher': {
			'@type': 'Organization',
			'name': 'UCSC.app',
			'url': 'https://ucsc.app'
		}
	};
}

/**
 * Generate LocalBusiness schema for dining locations
 */
export function generateLocalBusinessSchema(
	name: string,
	description: string,
	address: string
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		'name': name,
		'description': description,
		'address': {
			'@type': 'PostalAddress',
			'addressLocality': 'Santa Cruz',
			'addressRegion': 'California',
			'addressCountry': 'US',
			'streetAddress': address
		},
		'telephone': '+1-831-459-0111',
		'url': 'https://ucsc.app/menu',
		'sameAs': 'https://www.ucsc.edu'
	};
}

/**
 * Insert JSON-LD schema into document head
 */
export function injectSchema(schema: Record<string, unknown>) {
	const script = document.createElement('script');
	script.type = 'application/ld+json';
	script.textContent = JSON.stringify(schema);
	document.head.appendChild(script);
}

/**
 * Remove all JSON-LD scripts from head
 */
export function clearSchemas() {
	const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
	scripts.forEach(script => script.remove());
}
