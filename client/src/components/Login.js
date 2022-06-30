import React, {useState} from 'react'
import axios from 'axios'

function Login() {
    const [details, setDetails] = useState({username:"", password:""});
    async function submitHandler(e) {
		e.preventDefault()
		const detailsJson = JSON.stringify(details)

        try {
			await axios.post("http://localhost:3001/api/user/login", details, {
				headers: {
					'Content-Type': 'application/json'
				}
			})
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className="App">
        <form onSubmit={submitHandler}>
            <input type="submit" value="test"/>
			<input type="text" value={details.username} onChange={(e) => setDetails({...details, username: e.target.value})}/>
			<input type="password" value={details.password} onChange={(e) => setDetails({...details, password: e.target.value})}/>
        </form>
        </div>
    )
}
export default Login
