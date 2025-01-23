const userContainer = document.getElementById("users-container");

const fetchUsers = async ()=>{
    try{
        //fetch data from server
        const response = await fetch("/charecter");
        if(!response){
            throw new Error("Failed to get charecters");
        }

        //Parse json
        const users = await response.json();

        //Format the data to html
        userContainer.innerHTML = "";

        users.forEach((user) => {
            const userDiv = document.createElement("div");
            userDiv.className = "user";
            userDiv.innerHTML = `${user.firstname} ${user.lastname} Faction: ${user.faction}`;
            userContainer.appendChild(userDiv);
        });
    }catch(error){
        console.error("Error: ", error);
        userContainer.innerHTML = "<p style='color:red'>Failed to get charecters</p>"
    }
}

fetchUsers();