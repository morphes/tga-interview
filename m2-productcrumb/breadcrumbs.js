/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'Magento_Theme/js/model/breadcrumb-list'
], function ($, breadcrumbList) {
    'use strict';

    return function (widget) {
        $.widget('mage.breadcrumbs', widget, {
            options: {
                categoryUrlSuffix: '',
                useCategoryPathInUrl: true,
                product: '',
                menuContainer: '.nav-container.container > ul'
            },

            /** @inheritdoc */
            _init: function () {
                var menu;
                // render breadcrumbs after navigation menu is loaded.
                menu = $(this.options.menuContainer).data('mageMenu');
                if (typeof menu === 'undefined') {
                    $(this.options.menuContainer).on('menucreate', function () {
                        this._super();
                    }.bind(this));
                } else {
                    this._super();
                }
            },

            /** @inheritdoc */
            _render: function () {
                this._appendCatalogCrumbs();
                this._super();
            },

            /**
             * Append category and product crumbs.
             *
             * @private
             */
            _appendCatalogCrumbs: function () {
                var categoryCrumbs = this._resolveCategoryCrumbs();

                categoryCrumbs.forEach(function (crumbInfo) {
                    breadcrumbList.push(crumbInfo);
                });

                if (this.options.product) {
                    breadcrumbList.push({
                        'name': 'murata_product',
                        'label': 'Products',
                        'link': 'https://www.murata.com/products',
                        'title': '',
                        'target' : "_blank"
                    });
                    breadcrumbList.push(this._getProductCrumb());
                }
            },

            /**
             * Resolve categories crumbs.
             *
             * @return Array
             * @private
             */
            _resolveCategoryCrumbs: function () {
                var menuItem = this._resolveCategoryMenuItem(),
                    categoryCrumbs = [];

                if (menuItem !== null && menuItem.length) {
                    categoryCrumbs.unshift(this._getCategoryCrumb(menuItem));
                    menuItem = this._getParentMenuItem(menuItem)

                    categoryCrumbs.unshift(this._getParentCategoryCrumb(menuItem));
                    if(categoryCrumbs.length > 1) {
                        var topCategoryCrumb = this._getTopCategoryCrumb(menuItem);
                        if(topCategoryCrumb.name) {
                            var tcc = topCategoryCrumb.label.split(' ');
                            if(tcc.length == 2) {
                                categoryCrumbs.unshift({
                                    'name': 'murata_home',
                                    'label': tcc[0],
                                    'link': topCategoryCrumb.link,
                                    'title': ''
                                });
                                categoryCrumbs.unshift({
                                    'name': topCategoryCrumb.name,
                                    'label': tcc[1],
                                    'link': 'https://www.murata.com/products',
                                    'title': '',
                                    'target' : "_blank"
                                });
                            }
                        }
                    }
                }

                return categoryCrumbs;
            },

            /**
             * Returns crumb data.
             *
             * @param {Object} menuItem
             * @return {Object}
             * @private
             */
            _getCategoryCrumb: function (menuItem) {
                var categoryId,
                    categoryName,
                    categoryUrl;

                categoryId = /(\d+)/i.exec(menuItem.attr('id'))[0];
                categoryName = menuItem.text();
                categoryUrl = menuItem.attr('href');

                return {
                    'name': 'category' + categoryId,
                    'label': categoryName,
                    'link': categoryUrl,
                    'title': ''
                };
            },
            _getParentCategoryCrumb: function (menuItem) {
                var categoryId,
                    categoryName,
                    categoryUrl;

                categoryId = menuItem.attr('id');
                categoryName = menuItem.text();
                categoryUrl = menuItem.attr('href');

                return {
                    'name': 'category' + categoryId,
                    'label': categoryName,
                    'link': categoryUrl,
                    'title': ''
                };
            },
            _getTopCategoryCrumb: function (menuItem) {
                var category,
                    categoryId,
                    categoryName,
                    categoryUrl;

                category = jQuery('.mynav .level-top.ui-corner-all');
                categoryId = 0;
                categoryName = category.text();
                categoryUrl = '/products.html';

                return {
                    'name': 'category' + categoryId,
                    'label': categoryName,
                    'link': categoryUrl,
                    'title': ''
                };
            },
            /**
             * Returns product crumb.
             *
             * @return {Object}
             * @private
             */
            _getProductCrumb: function () {
                return {
                    'name': 'product',
                    'label': this.options.product,
                    'link': '',
                    'title': ''
                };
            },

            /**
             * Find parent menu item for current.
             *
             * @param {Object} menuItem
             * @return {Object|null}
             * @private
             */
            /*_getParentMenuItem: function (menuItem) {
             var classes,
             classNav,
             parentClass,
             parentMenuItem = null;

             if (!menuItem) {
             return null;
             }

             classes = menuItem.parent().attr('class');
             classNav = classes.match(/(nav\-)[0-9]+(\-[0-9]+)+/gi);

             if (classNav) {
             classNav = classNav[0];
             parentClass = classNav.substr(0, classNav.lastIndexOf('-'));

             if (parentClass.lastIndexOf('-') !== -1) {
             parentMenuItem = $(this.options.menuContainer).find('.' + parentClass + ' > a');
             parentMenuItem = parentMenuItem.length ? parentMenuItem : null;
             }
             }

             return parentMenuItem;
             },*/
            _getParentMenuItem: function (menuItem) {
                var classes,
                    classNav,
                    parentClass,
                    parentMenuItem = null;

                if (!menuItem) {
                    return null;
                }
                classNav = menuItem.parent().parent().parent().find('.parent');
                classes = classNav.attr('class');
                var id = classNav.data('id');
                if(classes){
                    parentMenuItem = $(this.options.menuContainer).find('a.menu-link-' + id);
                    parentMenuItem = parentMenuItem.length ? parentMenuItem : null;
                }

                return parentMenuItem;
            },

            /**
             * Returns category menu item.
             *
             * Tries to resolve category from url or from referrer as fallback and
             * find menu item from navigation menu by category url.
             *
             * @return {Object|null}
             * @private
             */
            _resolveCategoryMenuItem: function () {
                var categoryUrl = this._resolveCategoryUrl(),
                    menu = $(this.options.menuContainer),
                    categoryMenuItem = null;

                if (categoryUrl && menu.length) {
                    categoryMenuItem = menu.find('a[href="' + categoryUrl + '"]');
                }

                return categoryMenuItem;
            },

            /**
             * Returns category url.
             *
             * @return {String}
             * @private
             */
            _resolveCategoryUrl: function () {
                var categoryUrl;
                // this.options.useCategoryPathInUrl = 1;
                if (this.options.useCategoryPathInUrl) {
                    // In case category path is used in product url - resolve category url from current url.
                    categoryUrl = window.location.href.split('?')[0];
                    categoryUrl = categoryUrl.substring(0, categoryUrl.lastIndexOf('/')) +
                        this.options.categoryUrlSuffix;
                } else {
                    // In other case - try to resolve it from referrer (without parameters).
                    categoryUrl = document.referrer;

                    if (categoryUrl.indexOf('?') > 0) {
                        categoryUrl = categoryUrl.substr(0, categoryUrl.indexOf('?'));
                    }
                }

                return categoryUrl;
            }
        });

        return $.mage.breadcrumbs;
    };
});

