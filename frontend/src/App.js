import logo from './logo.svg';
import './App.css';
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'lkjsdfku4@#$@#o7w59 pajfclvkas%$#ur3daFDUA'

const register = async (e) => {
  e.preventDefault();
  console.log(e);

  const username = e.target[0].value;
  const password = e.target[1].value;

  const result = await fetch('http://localhost:5000/fullUser/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "username": username,
      password
    })
  }).then( res => res.json() );

  if(result.success){
    localStorage.setItem('token', result.data);
  }else {
    alert (result.error);
  }
};

const login = async (e) => {
  e.preventDefault();
  console.log(e);

  const username = e.target[0].value;
  const password = e.target[1].value;

  const result = await fetch('http://localhost:5000/fullUser/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  }).then( res => res.json() );

  if(result.status === 'ok'){
    localStorage.setItem('token', result.data);
  }else {
    alert (result.error);
  }

}

const update = async (e) => {
  e.preventDefault();
  console.log(e);

  const result = await fetch('http://localhost:5000/fullUser/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "token": localStorage.getItem('token'),
      "username": "ddftw",
      "name": "dhanvi",
    //   "bio":  "im so cool",
    //   "major": "cs",
    //   "year": 2023,
    //   "occupation": "UCSD Student",
    //   "date": "2021-05-21T22:58:40.106Z",
    //   "class": "Psi",
    //   "fam": "TNA",
    //   "description": "sports",
    //   "fb": "no",
      "linkedin": "no",
      "mentor": "Loooking",
    //   "mentee": "Ryan"
    })
  }).then( res => res.json() );

  console.log(result);
}

const cp = async (e) => {
  e.preventDefault();
  console.log(e);

  const password = e.target[0].value;

  const result = await fetch('http://localhost:5000/users/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "newpassword": password,
      token: localStorage.getItem('token')
    })
  }).then( res => res.json() );

  if(result.status === 'ok'){
    console.log('success');
  }else {
    alert (result.error);
  }

}

const logout = async (e) => {
  e.preventDefault();
  console.log(e);

  localStorage.removeItem('token');

}

const search = async (e) => {
  e.preventDefault();
  console.log(e);

  const username = e.target[0].value;

  const result = await fetch(`http://localhost:5000/fullUser/searchChat/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then( res => res.json() );

  console.log(result);
}

const findMentors = async (e) => {
  e.preventDefault();
  console.log(e);

  const tempUser = jwt.verify(localStorage.getItem('token'), JWT_SECRET);
  console.log(tempUser)
  const result = await fetch(`http://localhost:5000/fullUser/findMentors/${tempUser.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then( res => res.json() );

  console.log(result);

}

const findMentees = async (e) => {
  e.preventDefault();
  console.log(e);

  const tempUser = jwt.verify(localStorage.getItem('token'), JWT_SECRET);
  console.log(tempUser)
  const result = await fetch(`http://localhost:5000/fullUser/findMentees/${tempUser.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then( res => res.json() );

  console.log(result);

}


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Register</p>
        <form id="reg-form" onSubmit={register}>
          <input type="text" autocomplete="off" id="username" placeholder="Username" />
          <input type="password" autocomplete="off" id="password" placeholder="Password" />
          <input type="submit" value="Register" />
        </form>

        <br /><br /><br />

        <p>Login</p>
        <form id="login-form" onSubmit={login}>
          <input type="text" autocomplete="off" id="username" placeholder="Username" />
          <input type="password" autocomplete="off" id="password" placeholder="Password" />
          <input type="submit" value="Login" />
        </form>

        <p>Change Password</p>
        <form id="cp-form" onSubmit={cp}>
          <input type="password" autocomplete="off" id="password" placeholder="Password" />
          <input type="submit" value="Change Password" />
        </form>

        <p>Logout</p>
        <form id="cp-form" onSubmit={logout}>
          <input type="submit" value="Logout" />
        </form>

        <p>Update</p>
        <form id="update-form" onSubmit={update}>
          <input type="submit" value="Update" />
        </form>

        <p>Search</p>
        <form id="search-form" onSubmit={search}>
          <input type="text" autocomplete="off" id="username" placeholder="Username" /> 
          <input type="submit" value="Search" />
        </form>

        <p>Find Mentors</p>
        <form id="mentor-form" onSubmit={findMentors}> 
          <input type="submit" value="Find Mentors!" />
        </form>

        <p>Find Mentees</p>
        <form id="mentee-form" onSubmit={findMentees}> 
          <input type="submit" value="Find Mentees!" />
        </form>
      </header>
    </div>
  );
}

export default App;
