"use strict";

const expect = require("chai").expect;
const UrlResolver = require("../index");

class CaseUnit {
    constructor(rel, base, expectedResult) {
        this.rel = rel;
        this.base = base;
        this.expectedResult = expectedResult;
    }

    resolvedResult() {
        return UrlResolver.resolve(this.rel, this.base);
    }
}

let baseUrl = "http://a/b/c/d;p?q#f";
describe(`Test cases from RFC-1808. Base url: '${baseUrl}'`, () => {
    describe(`# Normal Case.`, () => {
        const testCases = [
            new CaseUnit("g:h", baseUrl, "g:h"),
            new CaseUnit("g", baseUrl, "http://a/b/c/g"),
            new CaseUnit("./g", baseUrl, "http://a/b/c/g"),
            new CaseUnit("g/", baseUrl, "http://a/b/c/g/"),
            new CaseUnit("/g", baseUrl, "http://a/g"),
            new CaseUnit("//g", baseUrl, "http://g"),
            new CaseUnit("?y", baseUrl, "http://a/b/c/d;p?y"),
            new CaseUnit("g?y", baseUrl, "http://a/b/c/g?y"),
            new CaseUnit("g?y/./x", baseUrl, "http://a/b/c/g?y/./x"),
            new CaseUnit("#s", baseUrl, "http://a/b/c/d;p?q#s"),
            new CaseUnit("g#s", baseUrl, "http://a/b/c/g#s"),
            new CaseUnit("g#s/./x", baseUrl, "http://a/b/c/g#s/./x"),
            new CaseUnit("g?y#s", baseUrl, "http://a/b/c/g?y#s"),
            new CaseUnit(";x", baseUrl, "http://a/b/c/d;x"),
            new CaseUnit("g;x", baseUrl, "http://a/b/c/g;x"),
            new CaseUnit("g;x?y#s", baseUrl, "http://a/b/c/g;x?y#s"),
            new CaseUnit(".", baseUrl, "http://a/b/c/"),
            new CaseUnit("./", baseUrl, "http://a/b/c/"),
            new CaseUnit("..", baseUrl, "http://a/b/"),
            new CaseUnit("../", baseUrl, "http://a/b/"),
            new CaseUnit("../g", baseUrl, "http://a/b/g"),
            new CaseUnit("../..", baseUrl, "http://a/"),
            new CaseUnit("../../", baseUrl, "http://a/"),
            new CaseUnit("../../g", baseUrl, "http://a/g"),
        ];

        testCases.forEach((unit) => {
            it(`should resolve '${unit.rel}' to '${unit.expectedResult}'`, () => {
                expect(unit.resolvedResult()).to.equal(unit.expectedResult);
            });
        });
    });

    describe(`# Abnormal Case.`, () => {
        const testCases = [
            new CaseUnit("", baseUrl, "http://a/b/c/d;p?q#f"),
            new CaseUnit("../../../g", baseUrl, "http://a/../g"),
            new CaseUnit("../../../../g", baseUrl, "http://a/../../g"),
            new CaseUnit("/./g", baseUrl, "http://a/./g"),
            new CaseUnit("/../g", baseUrl, "http://a/../g"),
            new CaseUnit("g.", baseUrl, "http://a/b/c/g."),
            new CaseUnit(".g", baseUrl, "http://a/b/c/.g"),
            new CaseUnit("g..", baseUrl, "http://a/b/c/g.."),
            new CaseUnit("..g", baseUrl, "http://a/b/c/..g"),
            new CaseUnit("./../g", baseUrl, "http://a/b/g"),
            new CaseUnit("./g/.", baseUrl, "http://a/b/c/g/"),
            new CaseUnit("g/./h", baseUrl, "http://a/b/c/g/h"),
            new CaseUnit("g/../h", baseUrl, "http://a/b/c/h"),
            new CaseUnit("http:g", baseUrl, "http:g"),
            new CaseUnit("http:", baseUrl, "http:"),
        ];

        testCases.forEach((unit) => {
            it(`should resolve '${unit.rel}' to '${unit.expectedResult}'`, () => {
                expect(unit.resolvedResult()).to.equal(unit.expectedResult);
            });
        });
    });
});

describe(`Custom test cases`, () => {
    const testCases = [
        new CaseUnit("about:blank", "", "about:blank"),
        new CaseUnit("http://baidu.com/", "", "http://baidu.com/"),
        new CaseUnit("http://baidu.com/", "#google", "http://baidu.com/"),
        new CaseUnit(
            "   path?query#hash ",
            "  http://www.baidu.com?query#hash    ",
            "http://www.baidu.com/path?query#hash"
        ),
        new CaseUnit(
            "http://baidu.com/",
            undefined,
            "http://baidu.com/"
        ),
        new CaseUnit(
            undefined,
            "http://baidu.com/",
            "http://baidu.com/"
        ),
        new CaseUnit(
            undefined,
            undefined,
            ""
        )
    ];

    testCases.forEach((unit) => {
        it(`should resolve '${unit.rel}' to '${unit.expectedResult}' base url: '${unit.base}'`, () => {
            expect(unit.resolvedResult()).to.equal(unit.expectedResult);
        });
    });
});
