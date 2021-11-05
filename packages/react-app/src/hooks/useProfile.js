import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx';

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register


function useProfile() {

  const getProfile = async(address) => {
    let newProfile;
    try{
      newProfile = await getLegacy3BoxProfileAsBasicProfile(address);
    } catch(err){

    }
    return(newProfile)
  }

  return({getProfile})
}

export default useProfile;
