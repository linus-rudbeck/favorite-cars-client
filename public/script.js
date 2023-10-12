const SETTINGS = {
    baseUrl: 'https://localhost:7068', // ÄNDRA TILL DIN EGEN URL & PORT
    JWT: null,
};

const login = async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${SETTINGS.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.status == 200) {
        SETTINGS.JWT = data.token;
    }
    else {
        alert('Invalid username or password!');
        return;
    }


    document.getElementById('register-login').style.display = 'none';
    document.getElementById('create-car').style.display = 'block';
    document.getElementById('cars').style.display = 'block';
    document.getElementById('car-likes').style.display = 'block';

    getCars();
    connectToHub();
}

const register = async () => {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const response = await fetch(`${SETTINGS.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, confirmPassword }),
    });

    if (response.status < 200 && response.status > 299) {
        alert('Username already exists!');
        return;
    }
}

const createCar = async () => {
    const make = document.getElementById('create-car-make').value;
    const model = document.getElementById('create-car-model').value;
    const year = document.getElementById('create-car-year').value;

    const response = await fetch(`${SETTINGS.baseUrl}/api/cars`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + SETTINGS.JWT,
        },
        body: JSON.stringify({ make, model, year }),
    });

    if (response.status >= 200 && response.status < 300) {
        alert('Car created successfully!');
    }
    else {
        alert('Invalid car data!');
    }

    document.getElementById('create-car-make').value = '';
    document.getElementById('create-car-model').value = '';
    document.getElementById('create-car-year').value = '';

    getCars();
}

const getCars = async () => {
    const response = await fetch(`${SETTINGS.baseUrl}/api/cars`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + SETTINGS.JWT,
        },
    });

    const data = await response.json();

    if (response.status == 200) {
        const cars = data.forEach(car => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${car.make} ${car.model} ${car.year}`;

            const likeButton = document.createElement('button');
            likeButton.innerHTML = '❤';
            likeButton.addEventListener('click', () => {
                likeCar(car.id);
            });
            listItem.appendChild(likeButton);

            document.getElementById('cars-list').appendChild(listItem);
        });
    }
    else {
        alert('Invalid car data!');
    }
}

const likeCar = async (carId) => {

    console.log(carId);

    const response = await fetch(`${SETTINGS.baseUrl}/api/cars/${carId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + SETTINGS.JWT,
        },
    });

    if (response.status != 200) {
        alert('Invalid car data!');
        return;
    }
}

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    login();
})

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    register();
})

document.getElementById('create-car-form').addEventListener('submit', (e) => {
    e.preventDefault();
    createCar();
})

function connectToHub(){
    var hub = new signalR.HubConnectionBuilder()
    .withUrl(`${SETTINGS.baseUrl}/realtimehub`) // Specify the hub URL
    .configureLogging(signalR.LogLevel.Information) // Configure logging
    .build();

    // Start the connection
    hub.start({ withCredentials: false })
        .then(() => console.log('Connection started!'))
        .catch(err => console.log('Error while establishing connection :('));

    // Handle connection close
    hub.onclose(() => {
        console.log('Connection closed.');
    });

    hub.on("CarLike", (username, make, model) => {
        const carLikes = document.getElementById('car-likes-list');
        const carLike = document.createElement('li');
        carLike.innerHTML = `${username} liked ${make} ${model}`;
        carLikes.appendChild(carLike);
    })
}


// ("CarLike", user.Username, car.Make, car.Model)