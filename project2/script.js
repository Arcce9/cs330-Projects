$(document).ready(function () {
    const SERPER_API_KEY = 'a5ac296b351f669326ce01cac8a668a8ed4bfd8a';
    
    const bgImages = [
        'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b")',
        'url("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05")',
        'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e")',
        'url("https://images.unsplash.com/photo-1501785888041-af3ef285b470")'
    ];
    let bgIndex = 0;

    $('#brandName, #bgToggle').on('click', function() {
        bgIndex = (bgIndex + 1) % bgImages.length;
        $('body').css('background-image', bgImages[bgIndex]);
    });


    $('#clearBtn').click(() => $('#query').val('').focus());


    $('#timeBtn').on('click', function() {
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');
        
        $('#time').text("Current Time: " + timeStr).dialog({
            modal: true,
            draggable: false,
            resizable: false,
            buttons: { "Close": function() { $(this).dialog("close"); } }
        });
    });


    function performSearch(query, isLucky = false) {
        if (!query) return;

        $.ajax({
            url: "https://google.serper.dev/search",
            method: "POST",
            headers: { 
                "X-API-KEY": SERPER_API_KEY, 
                "Content-Type": "application/json" 
            },
            data: JSON.stringify({ q: query }),
        }).done(function (response) {
            // Bonus: I'm Feeling Lucky
            if (isLucky && response.organic && response.organic.length > 0) {
                window.location.href = response.organic[0].link;
                return;
            }

            const resultsDiv = $('#searchResults');
            resultsDiv.empty().fadeIn(); // Unhide results div


            if (response.knowledgeGraph) {
                const kg = response.knowledgeGraph;
                resultsDiv.append(`
                    <div class="kg-box">
                        <strong style="color:#1a73e8">Knowledge Graph</strong>
                        <h3>${kg.title || ''}</h3>
                        <p>${kg.description || ''}</p>
                    </div>
                `);
            }


            if (response.peopleAlsoAsk && response.peopleAlsoAsk.length > 0) {
                resultsDiv.append('<h4 style="text-align:left">People Also Ask</h4>');
                response.peopleAlsoAsk.forEach(item => {
                    resultsDiv.append(`<p style="text-align:left; font-size:0.9rem; margin-left:10px;">• ${item.question}</p>`);
                });
            }


            if (response.organic) {
                resultsDiv.append('<h4 style="text-align:left; margin-top:20px;">Web Results</h4>');
                response.organic.forEach(item => {
                    resultsDiv.append(`
                        <div class="result-section">
                            <a href="${item.link}" target="_blank" style="text-decoration:none; color:#1a0dab;">
                                <h3 style="margin-bottom:5px;">${item.title}</h3>
                            </a>
                            <p style="color:#4d5156; font-size:0.9rem; margin:0;">${item.snippet}</p>
                        </div>
                    `);
                });
            }

            
            if (response.relatedSearches) {
                let related = '<p style="text-align:left; font-size:0.8rem; color:grey;">Related: ';
                response.relatedSearches.forEach(r => related += `<span>${r.query}, </span>`);
                related += '</p>';
                resultsDiv.append(related);
            }
        }).fail(function() {
            alert("Error connecting to Serper API.");
        });
    }


    $('#searchBtn').click(() => performSearch($('#query').val()));
    $('#luckyBtn').click(() => performSearch($('#query').val(), true));


    $('#query').keypress(function(e) {
        if(e.which == 13) performSearch($('#query').val());
    });
});