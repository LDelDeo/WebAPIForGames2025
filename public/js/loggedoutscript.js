const userContainer = document.getElementById("users-container");

const fetchUsers = async () => {
    try {
        // Fetch data from server
        const response = await fetch("/charecter"); // Correct spelling
        if (!response.ok) {
            throw new Error("Failed to get charecters");
        }

        // Parse JSON
        const users = await response.json();

        // Clear existing content in the container
        userContainer.innerHTML = "";

        users.forEach((user) => {
            const userDiv = document.createElement("div");
            const buttonContainer = document.createElement("div");
            const updateButton = document.createElement("button");
            const deleteButton = document.createElement("button");

            // Styling for user entry
            userDiv.className = "user";
            userDiv.innerHTML = `${user.firstname} ${user.lastname} | Faction: ${user.faction}`;
            userDiv.setAttribute("data-id", user._id); // Attach user ID to the div

            



            // Append userDiv and button container to main container
            userContainer.appendChild(userDiv);
            userContainer.appendChild(buttonContainer);
        });
    } catch (error) {
        console.error("Error: ", error);
        userContainer.innerHTML = "<p style='color:red'>Failed to get characters</p>";
    }
};

fetchUsers();
