function postSearchrequest(){
    var searchTerm = document.getElementById("searchTerm").value;

    var result = {searchTerm: searchTerm}

    $.post("http://localhost:3000/search", result,function(data, status){
        if(status === "success"){
            document.getElementById("currentSearchTerm").innerHTML = document.getElementById("searchTerm").value;
        }
            alert("Data: " + data + "\nStatus: " + status);
    });
}