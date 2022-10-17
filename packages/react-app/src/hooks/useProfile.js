import { Orbis } from "@orbisclub/orbis-sdk";


const orbis = new Orbis();

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register


const getProfile = async(address) => {
  try{
    let { data, error } = await orbis.getDids(address);
    return(data[0])
  } catch(err){

  }
}

export default getProfile;
