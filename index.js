'use strict';

/**
 * Parse target url into components
 * @param {string} url the url that going to be parsed
 */
function parseUrl(url) {
    let fragment; // Fragment Identifier
    let scheme; // Scheme
    let net_loc; // Network Location/Login
    let query; // Query Information
    let params; // Parameters
    let path; // Path

    let matches;

    // parse component: Fragment Identifier
    matches = url.match(/#(.*)/);
    if (matches) {
        fragment = matches[1] || null;
        url = url.replace(matches[0], '');
    }

    // parse compoennt: Scheme
    matches = url.match(/^([0-9a-zA-Z\+\.\-]+):/);
    if (matches) {
        scheme = matches[1];
        url = url.replace(scheme + ':', '');
    }

    // parse component: Network Location/Login
    matches = url.match(/^\/\/([0-9a-zA-Z\$_\-\.\+\!\*'\(\),%]*)/);
    if (matches) {
        net_loc = matches[1];
        url = url.replace(matches[0], '');
    }

    // parse component: Query Information
    matches = url.match(/\?(.*)/);
    if (matches) {
        query = matches[1] || null;
        url = url.replace(matches[0], '');
    }

    // parse component: Parameters
    matches = url.match(/;(.*)/);
    if (matches) {
        params = matches[1] || null;
        url = url.replace(matches[0], '');
    }

    // parse component: Path
    path = url;

    return {
        fragment,
        scheme,
        net_loc,
        query,
        params,
        path,
    }
}

/**
 * Load url components and return corresponding url.
 * @param {object} components Url components
 */
function loadComponentsToUrl(components) {
    let result = `${components.scheme}://${components.net_loc}`;
    if (components.path) {
        let cleanedPath = components.path;
        if (components.path.charAt(0) === '/') cleanedPath = cleanedPath.substring(1);
        result += `/${cleanedPath}`;
    }
    if (components.params) result += `;${components.params}`;
    if (components.query) result += `?${components.query}`;
    if (components.fragment) result += `#${components.fragment}`;

    return result;
}

/**
 * Resolve relative url to absolute url.
 * @param {string} rel relative url, or call it embedded url
 * @param {string} base base url
 */
function resolve(rel, base) {
    rel = rel.trim();
    base = base.trim();

    // If the base URL is the empty string (unknown), the embedded URL is interpreted as an absolute URL and we are done.
    if (!base || typeof base !== 'string') return rel;

    // If the embedded URL is entirely empty, it inherits the entire base URL (i.e., is set equal to the base URL) and we are done.
    if (!rel || typeof rel !== 'string') return base;

    const relComp = parseUrl(rel);

    // If the embedded URL starts with a scheme name, it is interpreted as an absolute URL and we are done.
    if (relComp.scheme) return rel;

    const baseComp = parseUrl(base);
    if (!baseComp.scheme) throw new Error('Invalid base URL');
    relComp.scheme = baseComp.scheme;

    if (relComp.net_loc) return loadComponentsToUrl(relComp);
    relComp.net_loc = baseComp.net_loc;

    // If the embedded URL path is preceded by a slash "/", the path is not relative.
    if (/^\//.test(relComp.path)) return loadComponentsToUrl(relComp);

    if (!relComp.path) {
        relComp.path = baseComp.path;
        if (relComp.params) return loadComponentsToUrl(relComp);
        relComp.params = baseComp.params;
        if (relComp.query) return loadComponentsToUrl(relComp);
        relComp.query = baseComp.query;
        return loadComponentsToUrl(relComp);
    } else {
        let path = '';
        let index;
        index = baseComp.path.lastIndexOf('/');
        if (index > -1) {
            path = baseComp.path.substring(0, index + 1);
        }
        path += relComp.path;

        // All occurrences of "./", where "." is a complete path segment, are removed.
        index = path.indexOf('/./');
        while (index > -1) {
            path = path.substring(0, index + 1) + path.substring(index + 3);
            index = path.indexOf('/./');
        }
        // If the path ends with "." as a complete path segment, that "." is removed.
        if (/^\.$/.test(path) || /\/\.$/.test(path)) {
            path = path.substring(0, path.length - 1);
        }
        // All occurrences of "<segment>/../", where <segment> is a complete path segment not 
        // equal to "..", are removed. Removal of these path segments is performed iteratively,
        // removing the leftmost matching pattern on each iteration, until no matching pattern
        // remains.
        let matches = path.match(/([^\/]+\/\.\.\/)/);
        while (matches && matches[1] !== '../../') {
            path = path.substring(0, matches.index) + path.substring(matches.index + matches[1].length);
            matches = path.match(/([^\/]+\/\.\.\/)/);
        }
        // If the path ends with "<segment>/..", where <segment> is a complete path segment not equal to "..", that "<segment>/.." is removed.
        matches = path.match(/([^\/]+\/\.\.)$/);
        if (matches) {
            path = path.substring(0, matches.index);
        }
        relComp.path = path;
    }

    return loadComponentsToUrl(relComp);
}

module.exports = {
    resolve,
};
