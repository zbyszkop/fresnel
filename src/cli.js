'use strict';
/**
 * The command-line interface for Fresnel.
 *
 * This module is invoked by `bin/fresnel` and is in charge of reading user
 * input such as CLI parameters, environment variables, and the `.fresnel.yml`
 * config file.
 *
 * Interacts with: {@link module:conductor conductor}.
 *
 * @module cli
 */

/* eslint-disable no-console */

const fs = require( 'fs' );
const path = require( 'path' );

const yaml = require( 'js-yaml' );

const conductor = require( './conductor' );
const printer = require( './printer' );

const helpGeneral = `
    Usage: fresnel <command> [options..]

COMMANDS

fresnel record           Run scenarios and generate a performance report.

fresnel compare          Document me.

fresnel help <command>   Display options and quick help for a given command.

fresnel version          The version of Fresnel is installed.
`;
const helpRecord = `
DESCRIPTION

    Run scenarios and generate a performance report.

    Configuration for scenarios is read from a .fresnel.yml
    file in the current working directory.

OPTIONS

    fresnel record [label]

    label      The label given to this Fresnel recording.
               Must be valid for use as a directory name.
               Default: "default"

ENVIRONMENT

    FRESNEL_DIR      Recordings will be saved to this directory.
                     Default: ".fresnel_records"

    CHROMIUM_FLAGS   Extra CLI options for the Chromium binary.
                     In Docker containers, Chromium typically
                     needs --no-sandbox.
`;
const helpCompare = `
DESCRIPTION

    (Document me.)

OPTIONS

    fresnel compare <label> <label>

    label      The label of a past Fresnel recording.

ENVIRONMENT

    FRESNEL_DIR      Recordings will be read from this directory.
                     Default: ".fresnel_records"
`;

function help( command ) {
	if ( command === 'record' ) {
		console.log( helpRecord );
	} else if ( command === 'compare' ) {
		console.log( helpCompare );
	} else {
		console.log( helpGeneral );
	}
}

/**
 * @private
 * @param {string} command
 * @param {...string} params
 * @return {Promise}
 * @reject {number} Process exit code
 */
function cli( command, ...params ) {
	if ( command === 'record' ) {
		// Read config file from current working directory
		const file = path.join( process.cwd(), '.fresnel.yml' );
		const config = yaml.safeLoad( fs.readFileSync( file, 'utf8' ) );
		const outputDir = process.env.FRESNEL_DIR || '.fresnel_records';

		const label = params[ 0 ] || 'default';
		if ( params[ 1 ] ) {
			// unknown parameter
			help( 'record' );
			return Promise.reject( 1 );
		}

		return conductor.record(
			config,
			outputDir,
			label,
			printer.progress.bind( null, console.log )
		);
	}

	if ( command === 'compare' ) {
		const outputDir = process.env.FRESNEL_DIR || '.fresnel_records';

		const [ before, after ] = params;
		if ( !before || !after || params[ 2 ] ) {
			// missing or unknown parameters
			help( 'compare' );
			return Promise.reject( 1 );
		}

		return conductor.compare( outputDir, before, after )
			.then( ( compared ) => {
				printer.comparison( console.log, compared.result );
				if ( compared.warnings.length ) {
					// TODO: Print warnings
					return Promise.reject( 1 );
				}
			} );
	}

	if ( command === 'version' ) {
		const version = require( '../package.json' ).version;
		console.log( `Fresnel ${version}` );

		return Promise.resolve();
	}

	if ( command === 'help' || !command ) {
		help( params[ 0 ] );

		return Promise.resolve();
	}

	console.error( `fresnel: Unknown command - ${command}` );
	help();

	return Promise.reject( 1 );
}

module.exports = cli;
