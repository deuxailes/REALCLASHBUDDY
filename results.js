
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const summonerName = urlParams.get('page')
const championByIdCache = {};
const championJson = {};
import championRoles from './RoleFinder.js';
import LeagueAPICaller from './LeagueAPICaller.js';
import getChampionByKey from './ChampionFinder.js';
var leagueAPI = new LeagueAPICaller();



async function loadFunction () {

    const player_account = await leagueAPI.getAccount(summonerName);
    const ranked_data = await leagueAPI.getRankedInfoByID(player_account.id);
    const currentGame = await leagueAPI.getCurrentGame(player_account.id);
    

    var gameParticpants = currentGame.participants;
    let jglerID = await championRoles(gameParticpants)
    
    console.log(await getChampionByKey(jglerID));
    document.getElementById('summonerNameHeader').innerHTML = player_account.name; 
    document.getElementById("profileImg").src = "/10.23.1/img/profileicon/" + player_account.profileIconId + ".png";
    var blueTeamDivs = document.getElementById("blueteam").getElementsByTagName("div");
    var redTeamDivs = document.getElementById("redteam").getElementsByTagName("div");
    
    for(var i = 0; i < 5; i++)
    { 
        let playerBLUE = gameParticpants[i]; 
        blueTeamDivs[i].querySelector("p.blue_playername").innerHTML = playerBLUE.summonerName;

        let playerRED = gameParticpants[i+5]; 
        redTeamDivs[i].querySelector("p.red_playername").innerHTML = playerRED.summonerName;
    }
}




function formatJSON(team)
{
    for(let i =0; i < team.length; i++)
    {
        if(team.charAt(i) === '\'')
            if(isLetter(team.charAt(i+1)) && isLetter(team.charAt(i-1)))
                console.log("Test");
            else
                team = setCharAt(team,i,"\"");
    }
    return team;
}
function setCharAt(str,index,chr)
{
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}
function isLetter(str) 
{
    return str.length === 1 && str.match(/[a-z]/i);
}
loadFunction();
