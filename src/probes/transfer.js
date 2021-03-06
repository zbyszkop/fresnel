'use strict';
/**
 * Get data from the Resource Timing API in the browser.
 *
 * @module probes/transfer
 * @see {@link Probe}
 * @see <https://www.w3.org/TR/resource-timing-2/>
 */

/* istanbul ignore next */
function browserCode() {
	/* eslint-env browser */
	return performance.getEntriesByType( 'resource' )
		.concat( performance.getEntriesByType( 'navigation' ) )
		.map( ( entry ) => entry.toJSON() );
}

module.exports = {
	async after( page, writer, addData ) {
		const response = await page.evaluate( browserCode );

		addData( {
			entries: response
		} );
	}
};
