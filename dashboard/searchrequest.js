function postSearchrequest(){
    var searchTerm = document.getElementById("searchTerm").value;

    var result = {searchTerm: searchTerm}

    $.post("http://localhost:3000/search", result,function(data, status){
            alert("Data: " + data + "\nStatus: " + status);
        });
}