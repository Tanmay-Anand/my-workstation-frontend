import { useDispatch } from 'react-redux';
import { clearCredentials } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const doLogout = () => {
    dispatch(clearCredentials());
    nav('/login');
  };
  return <button onClick={doLogout}>Logout</button>;
}
