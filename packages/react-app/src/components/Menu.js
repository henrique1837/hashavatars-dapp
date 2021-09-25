import React,{useState,useMemo} from "react";
import { Image } from 'react-bootstrap';
import { Button,IdentityBadge,EthIdenticon,Header,Tabs,Link as A } from '@aragon/ui';
import useWeb3Modal from '../hooks/useWeb3Modal';

import { Link } from 'react-router-dom';
function Menu(){
  const {loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId,profile} = useWeb3Modal();
  const [selected, setSelected] = useState(1);


  return(
    <>
    <Header
      primary={
        <>
          <h2>HashAvatars</h2>
          {
            netId &&
            (
              netId === 4 ?
              <>
              <Image src="data:image/png;base64,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" style={{width: '25px'}}/>
              <small>RINKEBY</small>
              </> :
              netId === 0x64 ?
              <>
              <Image src={require("../assets/xdai-logo.png")} style={{width: '25px'}}/>
              <small>XDAI</small>
              </> :
              "WRONG NETWORK"
            )
          }
          <A
            px={2}
            py={1}
            rounded={'md'}
            _hover={{
              textDecoration: 'none',
            }}
            href="https://twitter.com/thehashavatars"
            rel="noreferrer"
            target="_blank"
            >
            <Image style={{width: '20px'}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAE20lEQVRoge3YW2yTdRgG8Odta8GBzh3KoIOd7BzxiGICISCi3GDigQQmEYMYgk4JckEGKGAaTTSiaAwCTsF5gSEuiiEGvSIalwWIohciCE4YbMDKtnbrTh3t9z5ebMWNfB/raRsXfe6+Nf+3v6f/r/2WP5BOOumkk04SkbF408LdVx5UkRVULiRlGkAniYtUHlEba3xr8g5BhGZrsz6+VBBY574QvbYsULa/290XyvA3vCihVMFLqvyZYeVuQJeREBIACBJg/wVIgsRREa5qfm3Kyeja7O3NswXGJqr86690rx+2wN1fdX1BSuYpZ0Y5ysVIFj9tR4ubDjks4PR+sCV+4FraCW4leS+IRSQLSPjtevWelg3FzTcs4PmB45z+nlaAEwF8OSl/wuqfF0gkUXxR9bnxRui2WoAPx4aH2WsRIZa0VeYfHDzbZvaG4/w99w/gQXJlc2P3gZlVzEi0QKR34tok8d0gl9t49VjWtguvZL3X9DpIsSxAgXvwYIBPdo0P1pXtDZbFrffSIYINSeABsJHA9jAclwFZB/btin7JTQuIoZ3/L44Okhm083hpdXsFvDRdZ5Z8V+s8ErlJ4EFiOsmpAJoiEXkqsOnOjuh8U0jYbjQMxV8bNIHEbk9Bx6/F1f55sRQQG+9LEj/wd/7uIGd1vjH1zOD5pgXO/JPZAEiD+SCA5ENiyC/FewK1hZ8FFqOGdqsCpM2VPB5nx4nzkdaNBZeun29+K3hFCe658ScHgJwr4IHCQNvloqq2qsJPrzxRsKs9a/AoobYmiQfJdl/l5G4zquVzwLOv7XZbxPEHiRJTvEUxgCRxhorTAjYaQB7IJYnjAYJ1wY0Fc82cDqsC9c/nBD3VHctBHgaQESMe7H/ClkFYpkR0QeL4/teCVk7TW6i0uuO5u6qDNYDhAvACSV+M+GR+Kq3wAHntf5/rY7EDbFFyKWBbGscnPzJ4EArWWxUw3QGbho8CCN8MeBIQ4nhcBU6vcnWS+t3NgCcZ7go7j8VVAADE4Fsk+sYYDwhq4XX3xF2g/qWcvwCuH1M8ACq+tTLesAAAnFudvZPK9QAiY4In+2yRyDcJFwCA8xU5H0Iwn2TdKOMBYH+X13MlqQKFVS1TDDXuEOhGAl4q/KOBJ6E2MbYP57N8Ekdjh71HaXytlIkkABkVPATY17XZc2I437A7cPbl7A6lvDNat80APkgxtgxni6kAAFzMzdkG8NBo4AFAicreLZ7GlBVAuRiRHn1Wge9HGg/yYGhr0ecxuWIuAMBXObm7eY3raSVXkWgYCTzJU71qrLA61DJLYidzNbS7mi7PgU3mULkMwIwU4M9D5dGQt7ghHkrMOzAk5WKEpe9PKksBPJAavP2xePFAAjvg/uBSbtiBCirWApiUAvwRux2LuzeX+OK1xFwg7yNfCYQLCH2clGdI3joUkhBeobqjl7ZN8BYnfP46tAApU3e2LIoAFSBzQbpITCajp3Sp+cIScgLUV0NvltQmCjcvMJD8T5pyIoZjM4DVKcVD6qn6dkiL98ErmizeskA0ee83T1Anl0CxkuR8AJIAPqDKHwnZG9pS+FM8P5FJFxiczHfPZ9lucc4W6iwRzlQin2Q2BDlUjCfZSSIA0KeUk4D+rWBtr6fot1Qcz6eTTjrppDMi+Q8fgF/hmeYFBwAAAABJRU5ErkJggg=="/>
          </A>
          <A
            px={2}
            py={1}
            rounded={'md'}
            _hover={{
              textDecoration: 'none',
            }}
            href="https://t.me/thehashavatars"
            rel="noreferrer"
            target="_blank"
            >
            <Image style={{width: '20px'}} src="data:image/png;base64,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"/>

          </A>
          <A
            px={2}
            py={1}
            rounded={'md'}
            _hover={{
              textDecoration: 'none',
            }}
            href="https://github.com/henrique1837/hashavatars-dapp"
            rel="noreferrer"
            target="_blank"
            >
            <Image style={{width: '20px'}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABeklEQVRIidXUPU8VURSF4YeLgIQES0JhQSeQGPA3mChfkQgVhR1/g4QQNVJaameorCy0sLO2JRAQOoNKTEhosJJLMTO5w+YMM5eOlZzcj73Wu+ec2TncdvXU1HvxFMuYxv088xvf8Rmf8P8mzZ9gH+2adYi5bsA9WMd5A3ixzrGp/kTARhfguDbq4HMh8AgL2E7AfmAJD8L/M1XwO7LzLJv78togpvLPQTzEvbzWGzJ7pdwlLSaecqxuyxhJ5BaKYqtkXArBA9k41ulUdlxlRRbYCU/xvAG80LOQ3U6Z/gbTcBcNhkP2pCiUj6i/C2BUnP+7qQY/g6ly3BKaDb+PU6Ytl7d5hPEG8An8CtmPKWNqTP/hVQ6JmsTr3BNzL1IN+nQutzV8KQXeJvwfEuC2bLQHqrY7L7u4zjCKr/iTf0/tINVgpQpe6GVufFPjayXg7+rgdK7rNnbx7RpvGf5edp811mOdd3Jdg2MVL7WJWq7OeFmrGLop/HboAtvUneYxMJW3AAAAAElFTkSuQmCC"/>
          </A>
        </>
      }
      secondary={
        <>
        {
          coinbase ?
          <IdentityBadge
            customLabel={profile?.name}
            entity={coinbase}
            connectedAccount
            popoverTitle={profile?.name}
            icon={profile?.image ?
                  <Image src={profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")} style={{width: '25px'}} /> :
                  <EthIdenticon address={coinbase}/>
            }
          /> :
          <Button
            onClick={() => {
              if (!coinbase) {
                loadWeb3Modal();
              } else {
                logoutOfWeb3Modal();
              }
            }}
          >
            {!coinbase ? "Connect Wallet" : "Disconnect Wallet"}
          </Button>
        }
        </>
      }
    />
    <Tabs
      items={
        [
          <Link to="/home" style={{textDecoration: "none"}}>Informations</Link>,
          <Link to="/mint" style={{textDecoration: "none"}}><b>Generate Avatar</b></Link>,
          <Link to="/all-avatars" style={{textDecoration: "none"}}>All Avatars</Link>,
          coinbase && <Link to="/profile" style={{textDecoration: "none"}}>Profile</Link>
        ]
      }
      selected={selected}
      onChange={setSelected}
    />


    </>
  )
}


export default Menu;
