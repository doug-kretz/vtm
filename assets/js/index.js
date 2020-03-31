let app = {};

((app) => {

    app.state = {
        characters: [],
        templates: {},
        req_attempt: 0,
        req_success: 0
    };

    app.findChar = (id) => {
        for (let character of app.state.characters) {
            if (character.id == id) {
                return character;
            }
        }
    }

    let onCharClick = (e) => {
        $("#overlay").show();

        let character = app.findChar(e.data.id);
        if (character.detail) {
            $("#modal").html(Mustache.render(
                app.state.templates["char-detail"],
                character));
        } else {
            app.loadData(e.data.id);
        }
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
        mapContainer.find(".char-info").remove();

        if (app.state.req_attempt !== app.state.req_success) {
            // Content is still loading
            return;
        }

        // Add divs
        let cx = Math.round(canvas.width / 2.0);
        let cy = Math.round(canvas.height / 2.0);
        let aStep = Math.PI * 2 / app.state.characters.length;
        let r = (cx < cy ? cx : cy) / 1.3;
        let charInfoTemplate = app.state.templates["char-info"];

        for (let i = 0; i < app.state.characters.length; i++) {
            let character = app.state.characters[i];
            let a = i * aStep;
            let x = cx + r * Math.cos(a)
            let y = cy + r * Math.sin(a)

            mapContainer.append(
                $(Mustache.render(charInfoTemplate, character))
                .css("left", Math.round(x) - 64)
                .css("top", Math.round(y) - 32)
                .on("click", {
                        "id": character.id
                    },
                    onCharClick));
        }
    };

    let onTemplateLoaded = (html, status, jqXHR) => {
        let id = jqXHR.responseURL.substring(
            jqXHR.responseURL.lastIndexOf("/") + 1,
            jqXHR.responseURL.lastIndexOf("."));

        app.state.templates[id] = html;
        ++app.state.req_success;
        loadRelMap();
    };

    let loadTemplate = (name) => {
        ++app.state.req_attempt;
        $.ajax({
            url: `assets/template/${name}.html`,
            success: onTemplateLoaded,
            dataType: "html"
        });
    };

    let onDataLoaded = (json, status, jqXHR) => {
        let id = jqXHR.responseURL.substring(
            jqXHR.responseURL.lastIndexOf("/") + 1,
            jqXHR.responseURL.lastIndexOf("."));
        ++app.state.req_success;

        if ("characters" === id) {
            app.state.characters = json;
            loadRelMap();
        } else {
            let character = app.findChar(id);
            character.detail = json;
            $("#modal").html(Mustache.render(
                app.state.templates["char-detail"],
                character));
        }
    };

    app.loadData = (name) => {
        ++app.state.req_attempt;
        $.ajax({
            url: `assets/data/${name}.json`,
            success: onDataLoaded,
            dataType: "json"
        });
    };

    $(document).ready(() => {

        loadTemplate("char-detail");
        loadTemplate("char-info");
        app.loadData("characters");

        window.onresize = loadRelMap;
        $("#overlay").hide().click(() => $("#overlay").hide());
    });
})(app);