/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./lib/ThemeContext.js":
/*!*****************************!*\
  !*** ./lib/ThemeContext.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ThemeContext: () => (/* binding */ ThemeContext),\n/* harmony export */   ThemeProvider: () => (/* binding */ ThemeProvider),\n/* harmony export */   useTheme: () => (/* binding */ useTheme)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst ThemeContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\nfunction ThemeProvider({ children }) {\n    const [theme, setTheme] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"light\");\n    const [mounted, setMounted] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    // Load theme from localStorage on mount\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const saved = localStorage.getItem(\"theme\") || \"light\";\n        setTheme(saved);\n        setMounted(true);\n    }, []);\n    // Update document and localStorage when theme changes\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (!mounted) return;\n        localStorage.setItem(\"theme\", theme);\n        // Remove existing theme classes\n        document.documentElement.classList.remove(\"light\", \"dark\");\n        // Add the current theme class\n        document.documentElement.classList.add(theme);\n    }, [\n        theme,\n        mounted\n    ]);\n    const toggleTheme = ()=>{\n        setTheme((prev)=>prev === \"light\" ? \"dark\" : \"light\");\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(ThemeContext.Provider, {\n        value: {\n            theme,\n            toggleTheme\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"/workspaces/HospitalAppointmentSystem/HospitalAppointment/lib/ThemeContext.js\",\n        lineNumber: 33,\n        columnNumber: 5\n    }, this);\n}\nfunction useTheme() {\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(ThemeContext);\n    if (!context) {\n        throw new Error(\"useTheme must be used within ThemeProvider\");\n    }\n    return context;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvVGhlbWVDb250ZXh0LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQXNFO0FBRS9ELE1BQU1JLDZCQUFlSixvREFBYUEsR0FBRTtBQUVwQyxTQUFTSyxjQUFjLEVBQUVDLFFBQVEsRUFBRTtJQUN4QyxNQUFNLENBQUNDLE9BQU9DLFNBQVMsR0FBR1AsK0NBQVFBLENBQUM7SUFDbkMsTUFBTSxDQUFDUSxTQUFTQyxXQUFXLEdBQUdULCtDQUFRQSxDQUFDO0lBRXZDLHdDQUF3QztJQUN4Q0MsZ0RBQVNBLENBQUM7UUFDUixNQUFNUyxRQUFRQyxhQUFhQyxPQUFPLENBQUMsWUFBWTtRQUMvQ0wsU0FBU0c7UUFDVEQsV0FBVztJQUNiLEdBQUcsRUFBRTtJQUVMLHNEQUFzRDtJQUN0RFIsZ0RBQVNBLENBQUM7UUFDUixJQUFJLENBQUNPLFNBQVM7UUFDZEcsYUFBYUUsT0FBTyxDQUFDLFNBQVNQO1FBRTlCLGdDQUFnQztRQUNoQ1EsU0FBU0MsZUFBZSxDQUFDQyxTQUFTLENBQUNDLE1BQU0sQ0FBQyxTQUFTO1FBRW5ELDhCQUE4QjtRQUM5QkgsU0FBU0MsZUFBZSxDQUFDQyxTQUFTLENBQUNFLEdBQUcsQ0FBQ1o7SUFDekMsR0FBRztRQUFDQTtRQUFPRTtLQUFRO0lBRW5CLE1BQU1XLGNBQWM7UUFDbEJaLFNBQVNhLENBQUFBLE9BQVFBLFNBQVMsVUFBVSxTQUFTO0lBQy9DO0lBRUEscUJBQ0UsOERBQUNqQixhQUFha0IsUUFBUTtRQUFDQyxPQUFPO1lBQUVoQjtZQUFPYTtRQUFZO2tCQUNoRGQ7Ozs7OztBQUdQO0FBRU8sU0FBU2tCO0lBQ2QsTUFBTUMsVUFBVXRCLGlEQUFVQSxDQUFDQztJQUMzQixJQUFJLENBQUNxQixTQUFTO1FBQ1osTUFBTSxJQUFJQyxNQUFNO0lBQ2xCO0lBQ0EsT0FBT0Q7QUFDVCIsInNvdXJjZXMiOlsid2VicGFjazovL2hvc3BpdGFsLWFwcG9pbnRtZW50Ly4vbGliL1RoZW1lQ29udGV4dC5qcz85YTlhIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCdcblxuZXhwb3J0IGNvbnN0IFRoZW1lQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQoKVxuXG5leHBvcnQgZnVuY3Rpb24gVGhlbWVQcm92aWRlcih7IGNoaWxkcmVuIH0pIHtcbiAgY29uc3QgW3RoZW1lLCBzZXRUaGVtZV0gPSB1c2VTdGF0ZSgnbGlnaHQnKVxuICBjb25zdCBbbW91bnRlZCwgc2V0TW91bnRlZF0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICAvLyBMb2FkIHRoZW1lIGZyb20gbG9jYWxTdG9yYWdlIG9uIG1vdW50XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGhlbWUnKSB8fCAnbGlnaHQnXG4gICAgc2V0VGhlbWUoc2F2ZWQpXG4gICAgc2V0TW91bnRlZCh0cnVlKVxuICB9LCBbXSlcblxuICAvLyBVcGRhdGUgZG9jdW1lbnQgYW5kIGxvY2FsU3RvcmFnZSB3aGVuIHRoZW1lIGNoYW5nZXNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW1vdW50ZWQpIHJldHVyblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0aGVtZScsIHRoZW1lKVxuXG4gICAgLy8gUmVtb3ZlIGV4aXN0aW5nIHRoZW1lIGNsYXNzZXNcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnbGlnaHQnLCAnZGFyaycpXG5cbiAgICAvLyBBZGQgdGhlIGN1cnJlbnQgdGhlbWUgY2xhc3NcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0aGVtZSlcbiAgfSwgW3RoZW1lLCBtb3VudGVkXSlcblxuICBjb25zdCB0b2dnbGVUaGVtZSA9ICgpID0+IHtcbiAgICBzZXRUaGVtZShwcmV2ID0+IHByZXYgPT09ICdsaWdodCcgPyAnZGFyaycgOiAnbGlnaHQnKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8VGhlbWVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7IHRoZW1lLCB0b2dnbGVUaGVtZSB9fT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L1RoZW1lQ29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlVGhlbWUoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KFRoZW1lQ29udGV4dClcbiAgaWYgKCFjb250ZXh0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VUaGVtZSBtdXN0IGJlIHVzZWQgd2l0aGluIFRoZW1lUHJvdmlkZXInKVxuICB9XG4gIHJldHVybiBjb250ZXh0XG59XG4iXSwibmFtZXMiOlsiY3JlYXRlQ29udGV4dCIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlQ29udGV4dCIsIlRoZW1lQ29udGV4dCIsIlRoZW1lUHJvdmlkZXIiLCJjaGlsZHJlbiIsInRoZW1lIiwic2V0VGhlbWUiLCJtb3VudGVkIiwic2V0TW91bnRlZCIsInNhdmVkIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInNldEl0ZW0iLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsInRvZ2dsZVRoZW1lIiwicHJldiIsIlByb3ZpZGVyIiwidmFsdWUiLCJ1c2VUaGVtZSIsImNvbnRleHQiLCJFcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/ThemeContext.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles.css */ \"./styles.css\");\n/* harmony import */ var _styles_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_ThemeContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/ThemeContext */ \"./lib/ThemeContext.js\");\n\n\n\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_lib_ThemeContext__WEBPACK_IMPORTED_MODULE_2__.ThemeProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"/workspaces/HospitalAppointmentSystem/HospitalAppointment/pages/_app.js\",\n            lineNumber: 7,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/workspaces/HospitalAppointmentSystem/HospitalAppointment/pages/_app.js\",\n        lineNumber: 6,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBc0I7QUFDNkI7QUFFcEMsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNsRCxxQkFDRSw4REFBQ0gsNERBQWFBO2tCQUNaLDRFQUFDRTtZQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7O0FBRzlCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaG9zcGl0YWwtYXBwb2ludG1lbnQvLi9wYWdlcy9fYXBwLmpzP2UwYWQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuLi9zdHlsZXMuY3NzJ1xuaW1wb3J0IHsgVGhlbWVQcm92aWRlciB9IGZyb20gJy4uL2xpYi9UaGVtZUNvbnRleHQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8VGhlbWVQcm92aWRlcj5cbiAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cbiAgICA8L1RoZW1lUHJvdmlkZXI+XG4gIClcbn1cbiJdLCJuYW1lcyI6WyJUaGVtZVByb3ZpZGVyIiwiQXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles.css":
/*!********************!*\
  !*** ./styles.css ***!
  \********************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.js"));
module.exports = __webpack_exports__;

})();