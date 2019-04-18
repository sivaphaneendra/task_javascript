var usersData = null;
var usersUrl = "https://api.github.com/search/users?q=";
var max_page_results = 5;
var selectedUser_details = null;

function fetchUsers() {
    var users_response = JSON.parse(this.responseText);
    usersData = users_response;
    users_response = sortBy(users_response, "name", "asc");
    document.getElementById("sortBy").value = "name_asc";
    draw_users(users_response);
}

function changeOrder() {
    var selectedValue = document.getElementById("sortBy").value;
    if(selectedValue) {
        var data = sortBy(usersData, selectedValue.split('_')[0], selectedValue.split('_')[1]);
        draw_users(data);
    }
}

function sortBy(data, field, criteria) {
    //name asc order
    if(field === "name" && criteria === "asc") {
        data.items.sort(function(a, b){
            var nameA=a.login.toLowerCase(), nameB=b.login.toLowerCase()
            if (nameA < nameB) //sort string ascending
                return -1 
            if (nameA > nameB)
                return 1
            return 0 //default return value (no sorting)
        });
    }

    //name desc order
    if(field === "name" && criteria === "desc") {
        data.items.sort(function(a, b){
            var nameA=a.login.toLowerCase(), nameB=b.login.toLowerCase()
            if (nameA > nameB) //sort string ascending
                return -1 
            if (nameA < nameB)
                return 1
            return 0 //default return value (no sorting)
        });
    }

    //rank asc order
    if(field === "rank" && criteria === "asc") {
        data.items.sort(function(a,b){return a.score - b.score});
    }

    //rank desc order
    if(field === "rank" && criteria === "desc") {
        data.items.sort(function(a,b){return b.score - a.score});
    }

    return data;
}

var draw_users = function(data) {
  document.getElementById('total_count').innerHTML = data.total_count;
  document.getElementById('user_records').innerHTML = '';
  for(var i=0; i<data.items.length; i++) {
    var user_record = `<div class="user_record" id="index-${i}">
                        <div class="row">
                            <div class="col-md-2 col-lg-2 col-sm-2 col-xs-2">
                                <img src="${data.items[i].avatar_url}" alt="Profile_pic" class="img-circle img_avatar" />
                            </div>

                            <div class="col-md-10 col-lg-10 col-sm-10 col-xs-10">
                                <div class="profile_name">${data.items[i].login}</div>
                                <div class="profile_url">Profile URL: ${data.items[i].html_url}</div>
                                <button type="button" class="btn btn-default btn_details" onclick="getRepos('${data.items[i].login}', 'index-${i}')">Details</button>
                            </div>
                        </div>
                    </div>`; 
    document.getElementById('user_records').appendChild(htmlToElement(user_record));
  }
  addPagination();
}

function addPagination() {
    document.getElementById('pagination').innerHTML = '';
    var totalResultsCount = usersData.total_count;
    if(totalResultsCount > 0){
        var pageCount = 0;
        if(Math.floor(totalResultsCount / max_page_results) <= 0) {
            pageCount = 1;
        } else if(Math.floor(totalResultsCount % max_page_results) === 0) {
            pageCount = Math.floor(totalResultsCount / max_page_results);
        } else if(Math.floor(totalResultsCount / max_page_results) >= 1) {
            pageCount = Math.floor(totalResultsCount / max_page_results) +1;
        }

        document.getElementById('pagination').appendChild(htmlToElement('<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">Previous</a></li>'));
        for(var i=0; i<pageCount; i++){
            var pageNumber = i+1;
            if(pageNumber == 1) {
                document.getElementById('pagination').appendChild(htmlToElement('<li class="page-item active" onclick="hideuserRecords('+pageNumber+')"><a class="page-link" href="#">'+ pageNumber +'</a></li>'));
            } else if(pageNumber == 2) {
                document.getElementById('pagination').appendChild(htmlToElement('<li class="page-item" onclick="hideuserRecords('+pageNumber+')"><a class="page-link" href="#">'+ pageNumber +'</a></li>'));
            } else if(pageNumber >=3 && pageNumber < pageCount - 2) {
                if(!document.getElementById('more')) {
                    document.getElementById('pagination').appendChild(htmlToElement('<li class="page-item disabled" id="more"><span>...</span></li>'));
                }
            } else if(pageNumber == pageCount - 1 || pageNumber == pageCount - 2) {
                document.getElementById('pagination').appendChild(htmlToElement('<li class="page-item" onclick="hideuserRecords('+pageNumber+')"><a class="page-link" href="#">'+ pageNumber +'</a></li>'));
            }
        }
        if(pageCount == 1) {
             document.getElementById('pagination').appendChild(htmlToElement('<li class="page-item disabled"><a class="page-link" href="#">Next</a></li>'));
        } else {
             document.getElementById('pagination').appendChild(htmlToElement('<li class="page-item"><a class="page-link" href="#">Next</a></li>'));
        }
    }

    hideuserRecords(1);
}

function hideuserRecords(pageCount) {
    var min_results = pageCount - 1;
    var max_results = max_page_results - pageCount;

    var user_records = document.getElementsByClassName("user_record");
    for(var i = 0; i < user_records.length; i++)
    {
        if(user_records[i].getAttribute("id")) {
            var index = user_records[i].getAttribute("id").split('-')[1];
            user_records[i].classList.add("hide_user_record");
            if(min_results >= index  || max_results >= index) {
               user_records[i].classList.remove("hide_user_record");
            }
        }
    }
}
 
function searchusers() {
    var searchString = document.getElementById("usersSearch").value;
    var final_url = null;
    if(!searchString) {
        final_url = usersUrl+'sivaphaneendra';
    } else {
        final_url = usersUrl+searchString;
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", fetchUsers);
    oReq.open("GET", final_url);
    oReq.send();
}

function getRepos(loginId, user_record) {
    var repos_url = "https://api.github.com/users/"+loginId+"/repos";
    selectedUser_details = user_record;
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", respositoryDetails);
    oReq.open("GET", repos_url);
    oReq.send();
}

function respositoryDetails(){
    var rep_details = JSON.parse(this.responseText);
    var user_details = '<div class="user_details">';
    if(rep_details.length > 0) {     
        for(var i=0; i<rep_details.length; i++) {
            var oddEvenClass = (i%2 === 0) ? 'even': 'odd';
            user_details += `<div class="row ${oddEvenClass}">
                                    <div class="col-md-6 col-lg-6 col-sm-6 col-xs-6">
                                        <span class="data_label">${rep_details[i].name}</span>
                                    </div>

                                    <div class="col-md-6 col-lg-6 col-sm-6 col-xs-6">
                                        <span class="data_value">${rep_details[i].language}</span>
                                    </div>
                                </div>`;
        }  
    } else {
        user_details += `<div class="row even">
                                    <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12">
                                        <span class="data_label">No repositories found</span>
                                    </div>
                                </div>`;
    }
    user_details += '</div>';
    var selected_user_record = document.getElementById(selectedUser_details);
    var details = htmlToElement(user_details);
    selected_user_record.parentNode.insertBefore(details, selected_user_record.nextSibling);
}

var InitPageLoad = function() {
    document.getElementById("usersSearch")
        .addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("searchIcon").click();
        }
    });   

    searchusers();
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

InitPageLoad();