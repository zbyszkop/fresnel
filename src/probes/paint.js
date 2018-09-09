'use strict';
/**
 * Get data from the Paint Timing API in the browser.
 *
 * @module probes/paint
 * @see {@link Probe}
 * @see <https://www.w3.org/TR/paint-timing/>
 */

/* istanbul ignore next */
function browserCode() {
	/* eslint-env browser */
	const result = {};
	performance.getEntriesByType( 'paint' ).forEach( ( entry ) => {
		// first-paint
		// first-contentful-paint
		result[ entry.name ] = entry.startTime;
	} );
	return result;
}

module.exports = {
	after( page, writer, addData ) {
		return page.evaluate( browserCode ).then( ( response ) => {
			addData( response );
		} );
	}
};
