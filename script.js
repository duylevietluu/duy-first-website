// same as document.addEventListener("DOM...")

$(function () {
    $("#navbarToggle").blur(function(event) {
        var screenWidth = window.innerWidth;

        if (screenWidth < 768) {
            $("#collapsable-nav").collapse('hide');
        }
    });
});


(function (global) {
    var dc = {};

    var homeHtml = "snippets/home-snippet.html";
    var allCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
    var categoriesTitleHtml = "snippets/categories-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var menuItemUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/{{short_name}}.json";
    var menuItemsTitleHtml = "snippets/menu-items-title.html";
    var menuItemHtml = "snippets/menu-item.html";

    // insert into selector given html code
    var insertHtml = function (selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };

    // show loading icon
    var showLoading = function(selector) {
        var html = "<div class='text-center'> <img src='https://raw.githubusercontent.com/jhu-ep-coursera/fullstack-course4/master/examples/Lecture60/after/images/ajax-loader.gif'> </div>";

        insertHtml(selector, html);
    }

    // string replacement
    var insertProperties = function (string, propName, propValue) {
        var propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, 'g'), propValue);

        return string;
    }


    // load the homepage 
    document.addEventListener("DOMContentLoaded", function (event) {
        showLoading("#main-content");

        $ajaxUtils.sendGetRequest(
            homeHtml,
            function(responseText) {
                document.querySelector('#main-content').innerHTML = responseText;
            },
            false
        );
    });

    // load the menu categories view
    dc.loadMenuCategories = function () {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(
            allCategoriesUrl,
            buildAndShowCategoriesHTML
        )
    };

    function buildAndShowCategoriesHTML(categoriesResult) {
        $ajaxUtils.sendGetRequest(
            categoriesTitleHtml,
            function (categoriesTitleHtmlResult) {
                $ajaxUtils.sendGetRequest (
                    categoryHtml,
                    function (categoryHtmlResult) {
                        var categoriesViewHtml = buildCategoriesViewHtml(categoriesResult, categoriesTitleHtmlResult, categoryHtmlResult);

                        console.log(categoriesViewHtml);
                        insertHtml("#main-content", categoriesViewHtml);
                    },
                    false
                );
            },
            false
        );
    };

    function buildCategoriesViewHtml(categoriesParam, categoriesTitleHtmlParam, categoryHtmlParam) {
        var finalHtml = categoriesTitleHtmlParam;

        finalHtml += "<section class='row'>";

        for (var i = 0; i < categoriesParam.length; i++) {
            var html = categoryHtmlParam;
            var name = categoriesParam[i].name;
            var short_name = categoriesParam[i].short_name;

            html = insertProperties(html, "name", name);
            html = insertProperties(html, "short_name", short_name);

            finalHtml += html;
        }

        finalHtml += "</section>";
        return finalHtml;
    }

    // load the menu items of a specific menu catogory
    dc.loadMenuItems = function (catogoryShort) {
        showLoading("#main-content");

        $ajaxUtils.sendGetRequest(
            insertProperties(menuItemUrl, "short_name", catogoryShort),
            buildAndShowMenuItemsHTML
        );
    };

    //
    function buildAndShowMenuItemsHTML(categoryMenuItems) {
        $ajaxUtils.sendGetRequest(
            menuItemsTitleHtml,
            function(menuItemsTitleHtmlParam) {
                // retrieve
                $ajaxUtils.sendGetRequest(
                    menuItemHtml,
                    function(menuItemHtmlParam) {
                        var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtmlParam, menuItemHtmlParam);

                        insertHtml("#main-content", menuItemsViewHtml);
                    },
                    false
                );
            },
            false
        );
    }

    function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtmlParam, menuItemHtmlParam) {
        menuItemsTitleHtmlParam = insertProperties(menuItemsTitleHtmlParam, "name", categoryMenuItems.category.name);
        menuItemsTitleHtmlParam = insertProperties(menuItemsTitleHtmlParam, "special_instructions", categoryMenuItems.category.special_instructions);

        var finalHtml = menuItemsTitleHtmlParam;

        finalHtml += "<section class='row'>";

        // loop over menu items
        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;

        for (var i = 0; i < menuItems.length; i++) {
            var html = menuItemHtmlParam;
            html = insertProperties(html, "short_name", menuItems[i].short_name);
            html = insertProperties(html, "catShortName", catShortName);

            html = insertItemPrice(html, "price_small", menuItems[i].price_small);
            html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);

            html = insertItemPrice(html, "price_large", menuItems[i].price_large);
            html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
            
            html = insertProperties(html, "name", menuItems[i].name);
            html = insertProperties(html, "description", menuItems[i].description);

            finalHtml += html;
        }

        finalHtml += "</section>";

        console.log(finalHtml);

        return finalHtml;
    }

    function insertItemPrice(html, pricePropName, priceValue) {
        if (!priceValue) {
            return insertProperties(html, pricePropName, "");
        }

        return insertProperties(html, pricePropName, "$" + priceValue.toFixed(2));
    }

    function insertItemPortionName(html, portionPropName, portionValue) {
        if (!portionValue) {
            return insertProperties(html, portionPropName, "");
        }

        return insertProperties(html, portionPropName, "(" + portionValue + ")");
    }

    global.$dc = dc;
} (window));
