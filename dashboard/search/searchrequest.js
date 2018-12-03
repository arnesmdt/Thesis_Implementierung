function postSearchrequest(){
    const searchTerm = document.getElementById("searchTerm").value;
    const searchAmount = document.getElementById("searchRange").value;

    const result = {searchTerm: searchTerm, searchAmount: searchAmount};

    $.post("http://localhost:3000/search", result, function(data, status){
        console.log(status);
        // Frontend zurücksetzen, wenn ein neuer Suchauftrag gepostet wird
        if(status === 'success'){
            $("#sendButton").addClass('disabled');
            $("#graph").empty();
            $('#listgroup1').empty();
            $('#listgroup2').empty();
            start();
        }
    });
}

function start(){
    $.get("http://localhost:3000/tweets", function(data){
        const res = JSON.parse(data);
        if(res.nodes.length > 0){
            createList();
            $("#sendButton").removeClass('disabled');
        }
        else
            start();
    });
}