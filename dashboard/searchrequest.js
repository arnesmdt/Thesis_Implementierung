function postSearchrequest(){
    const searchTerm = document.getElementById("searchTerm").value;

    const result = {searchTerm: searchTerm};

    $.post("http://localhost:3000/search", result, function(data, status){
        if(status === "success"){
            document.getElementById("currentSearchTerm").innerHTML = document.getElementById("searchTerm").value;
        }
    });
}