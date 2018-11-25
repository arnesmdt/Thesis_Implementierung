function postSearchrequest(){
    const searchTerm = document.getElementById("searchTerm").value;
    const searchAmount = document.getElementById("searchRange").value;

    const result = {searchTerm: searchTerm, searchAmount: searchAmount};

    $.post("http://localhost:3000/search", result, function(data, status){
        console.log(status);
    });
}

