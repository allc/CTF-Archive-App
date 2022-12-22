import { BrowserRouter as Router , Routes, Route } from 'react-router-dom';
import Ctfs from './Ctfs';
import CtfPage from './Ctf';
import TopBar from './TopBar';
import DiscordAuth from './DiscordAuth';
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
    }

    this.setUser = this.setUser.bind(this);
  }

  setUser(user) {
    this.setState({
      user: user,
    });
  }

  render() {
    return (
      <>
        <TopBar user={this.state.user} setUser={this.setUser} />
        <Router>
        <Routes>
          <Route path='/ctfs' element={<Ctfs />} />
          <Route path='/ctf/:slug' element={<CtfPage />}/>
          <Route path='/auth/discord' element={<DiscordAuth setUser={this.setUser} />} />
        </Routes>
      </Router>
      </>
    );
  }
}

export default App;
