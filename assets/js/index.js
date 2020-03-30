let app = {};

((app) => {

    app.state = {
        characters: [],
        templates: {},
        req_attempt: 0,
        req_success: 0
    };

    let loadRelMap = () => {

        // Resize
        let mapContainer = $("#rel-map");
        let canvas = mapContainer.find("canvas").get(0);
        canvas.width = mapContainer.width();
        canvas.height = mapContainer.height();

        if (app.state.characters.length === 0) {
            return;
        }

        // Cleanup
        mapContainer.find(".character").remove();

        if (app.state.req_attempt !== app.state.req_success) {
            // Content is still loading
            return;
        }

        // Add divs
        let cx = Math.round(canvas.width / 2.0);
        let cy = Math.round(canvas.height / 2.0);
        let aStep = Math.PI * 2 / app.state.characters.length;
        let r = (cx < cy ? cx : cy) / 1.3;

        for (let i = 0; i < app.state.characters.length; i++) {
            let a = i * aStep;
            let x = cx + r * Math.cos(a)
            let y = cy + r * Math.sin(a)

            mapContainer.append($("<div/>")
                .html(Mustache.render(app.state.templates["char-info"], app.state.characters[i]))
                .addClass("character")
                .css("left", Math.round(x) - 64)
                .css("top", Math.round(y) - 32));
        }
    };

    let onTemplatesLoaded = (html, status, jqXHR) => {
        let id = jqXHR.responseURL.substring(
            jqXHR.responseURL.lastIndexOf("/") + 1,
            jqXHR.responseURL.lastIndexOf("."));

        app.state.templates[id] = html;
        ++app.state.req_success;
        loadRelMap();
    };

    let onCharListLoaded = (data) => {
        ++app.state.req_success;
        app.state.characters = data;
        loadRelMap();
    };

    let loadTemplate = (name) => {
        ++app.state.req_attempt;
        $.ajax({
            url: `assets/template/${name}.html`,
            success: onTemplatesLoaded,
            dataType: "html"
        });
    };

    $(document).ready(() => {

        loadTemplate("char-detail");
        loadTemplate("char-info");

        ++app.state.req_attempt;
        $.ajax({
            url: "assets/data/characters.json",
            success: onCharListLoaded,
            dataType: "json"
        });

        window.onresize = loadRelMap;
    });
})(app);