/**
 * The object from wich the app controller must inherit.
 * The controller is controlled by the router and manage the different views.
 */
define([
    'globals',
    'jquery',
    'core/utils/PageSlider',
], function (globals, $, PageSlider) {
    'use strict';

    var AppController = function() {
        this._init();
    };

    AppController.prototype = {

        useLayouts: [],
        usePages: [],
        layoutForPages: {},

        _init: function() {
            var that = this;

            // Create layout instances
            var Layout = null;
            this.layouts = {};
            for (var key in this.useLayouts) {
                Layout = this.useLayouts[key];
                this.layouts[Layout.prototype.name] = new Layout();
            }

            // Create page instances
            var View = null;
            this.pages = {};
            for (key in this.usePages) {
                View = this.usePages[key];
                this.pages[View.prototype.name] = new View();
            }

            // Associate pages with layouts
            var loadPageMaker = function(layout, page) {

                return function() {
                    // We pass the action arguments to page.beforeLoad
                    page.beforeLoad.apply(page, arguments);
                    that._loadPage(layout, page);
                };
            };

            for (var actionName in this.pageForActions) {
                var pageName = this.pageForActions[actionName].page;
                var layoutName = this.pageForActions[actionName].layout;

                if (!this.pages[pageName]) {
                    console.error('Unknown page in Controller: ' + pageName);
                }
                else if (!this.layouts[layoutName]) {
                    console.error('Unknown layout in Controller: ' + layoutName);
                }
                else {
                    this[pageName] = loadPageMaker(this.layouts[layoutName], this.pages[pageName]);
                }
            }
        },

        /**
         * Load a Page in the given layout.
         */
        _loadPage: function (layout, page) {
            layout.setPage(page);
            layout.render();
            layout.$el.addClass(page.name);

            globals.router.slider.slidePage(layout.$el, {

                beforeTransition: function() {
                    page.afterRender();

                    // Switch the fixed element to absolute positionning
                    // To prevent odd behaviour during transition
                    $('[data-fixed]').attr('data-fixed', 'absolute');
                },
                afterTransition: function(wasFirstSlide) {

                    // Switch back the fixed elements
                    $('[data-fixed]').attr('data-fixed', 'fixed');

                    // Lets the UI thread breathe a little before calling afterLoad
                    setTimeout(function() {
                        page.afterLoad();
                    }, 0);

                    // If we just rendered the first page, we hide the splashscreen
                    if (wasFirstSlide) {

                        setTimeout(function() {

                            // Force reflow before hiding the splashscreen.
                            /*jshint -W030*/
                            layout.el.offsetHeight;

                            // Hide the splashscreen
                            navigator.splashscreen.hide();

                        }, 500); // 500ms safety to prevent splashscreen flickering
                    }
                },
            });
            layout.delegateEvents();
            page.delegateEvents();
        },

    };

    AppController.extend = function(newProps) {

        var Child = function() {
            AppController.apply(this, arguments);
        };
        Child.prototype = $.extend(true, {}, AppController.prototype, newProps);
        Child.prototype.constructor = Child;

        return Child;
    };

    return AppController;

});
