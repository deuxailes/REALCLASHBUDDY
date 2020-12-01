import LeagueAPICaller from './LeagueAPICaller.js';
import getChampionByKey from './ChampionFinder.js'
var leagueAPI = new LeagueAPICaller();
var championRatesJSON;

export default async function championRoles(players)
{
    let redTeam = players.slice(0,5);
    let blueTeam = players.slice(5,10);
    championRatesJSON = await leagueAPI.pull_champion_rates();
    return findTeamRole(redTeam);
    
}

function findTeamRole(team)
{   
    let champions = Object.values(team).map(player => player.championId);
    let jgler = null;
    let smiteCnt = 0;
    console.log(team);
    for(let player of team)
    {
        if(player.spell1Id == 11 || player.spell2Id == 11)
        {
            if(jgler == undefined){
                jgler = player.championId;
                smiteCnt++;
            }    
            else if(smiteCnt == 1)
            {
                let playRate1 = championRatesJSON['Data'][jgler]['JUNGLE']['playRate'];
                let playRate2 = championRatesJSON['Data'][player.championId]['JUNGLE']['playRate'];

                if(playRate1 < playRate2)
                {
                    jgler = player.championId;
                }

                console.log("test: " + getChampionByKey(jgler));

            }
                
        }

    }

    if(jgler)
    {
        let i = champions.indexOf(jgler);
        champions.splice(i,1);
        getRolesWithJungler(champions,jgler,team);
        
    } 
    else 
        getRolesNoJungler(champions);


    return jgler;
}

async function getRolesWithJungler(champions,jgler,team)
{
    let identifed = [];
    let playersHistory = [];
    
    for(let player of team)
    {
        let playerAccountID = await leagueAPI.getAccount(player.summonerName);
        let matchHistoryData = await leagueAPI.getMatchHistory(playerAccountID.accountId);
        if(player.championId != jgler)
            playersHistory.push(matchHistoryData);
    }    

    let laneRates = await analyze(playersHistory,champions);


    
    for(let j = laneRates.length-1; j >= 0; j--)                        //FINDS SUPPORT FIRST THEN ---> ADC ----> MIDDLE ----> TOP
    {
        let champIndex = [0,0,0]; //1st Highest Rate Champ--->2nd--->3rd
        var highestLaneRate = Number.NEGATIVE_INFINITY;
        var secondHighestLaneRate = Number.NEGATIVE_INFINITY;
        var thirdHighestLaneRate = Number.NEGATIVE_INFINITY;

        for(let i = 0; i < laneRates.length; i++)
        {
            if(highestLaneRate < laneRates[i][j])
            {
                thirdHighestLaneRate = secondHighestLaneRate;
                secondHighestLaneRate = highestLaneRate;
                highestLaneRate = laneRates[i][j];
                champIndex[2] = champIndex[1];
                champIndex[1] = champIndex[0];
                champIndex[0] = i;

            }
            else if( secondHighestLaneRate < laneRates[i][j])
            {
                thirdHighestLaneRate = secondHighestLaneRate;
                secondHighestLaneRate = laneRates[i][j];
                champIndex[2] = champIndex[1];
                champIndex[1] = i;
            }
            else if(thirdHighestLaneRate < laneRates[i][j]){
                thirdHighestLaneRate = laneRates[i][j];
                champIndex[2] = i;
            }

            
        }

        console.log("FIRST LANE: " + highestLaneRate);
        console.log("SECOND LANE: " + secondHighestLaneRate);
        console.log("THIRD LANE: " + thirdHighestLaneRate);
        console.log("--------------------");

        let diff  = highestLaneRate - secondHighestLaneRate;
        let diff2 = secondHighestLaneRate - thirdHighestLaneRate;


        if(diff > .5)
        {
            if(diff2 > .15 && diff2 != Number.POSITIVE_INFINITY)
            {
                if(champIndex[0] >= 0 && champIndex[1] >= 0 && champIndex[2] >= 0 )
                {
                    let role = getPosition(j);

                    let playRate1 = 0;
                    let playRate2 = 0;
                    let playRate3 = 0;

                    let champion1 = champions[champIndex[0]];
                    let champion2 = champions[champIndex[1]];
                    let champion3 = champions[champIndex[2]];

                    playRate1 = championRatesJSON['Data'][champions[champIndex[0]]][role]['playRate'];                  
                    playRate2 = championRatesJSON['Data'][champions[champIndex[1]]][role]['playRate'];
                    playRate3 = championRatesJSON['Data'][champions[champIndex[2]]][role]['playRate'];

                    let max = Math.max(playRate1,playRate2,playRate3);
                    
                    if(max == playRate1)
                    {
                        identifed.push(await getChampionByKey(champions[champIndex[0]]));
                        laneRates.splice(champIndex[0],1);
                        champions.splice(champIndex[0],1);
                        console.log(laneRates);
                    }
                    else if(max == playRate2){
                        identifed.push(await getChampionByKey(champions[champIndex[1]]));
                        laneRates.splice(champIndex[1],1);
                        champions.splice(champIndex[1],1);
                        console.log(laneRates);
                    }
                    else if(max == playRate3)
                    {
                        identifed.push(await getChampionByKey(champions[champIndex[2]]));
                        laneRates.splice(champIndex[2],1);
                        champions.splice(champIndex[2],1);
                        console.log(laneRates);
                    }
                }
            }
            else
            {
                identifed.push(await getChampionByKey(champions[champIndex[0]]));
                laneRates.splice(champIndex[0],1);
                champions.splice(champIndex[0],1);
                console.log(laneRates);
            }
        }
        else
        {
            if(champIndex[0] >= 0 && champIndex[1] >= 0 )
            {
                let role = getPosition(j);
                let playRate1 = 0;
                let playRate2 = 0;

                let champion1 = champions[champIndex[0]];
                let champion2 = champions[champIndex[1]];
                  
                playRate1 = championRatesJSON['Data'][champions[champIndex[0]]][role]['playRate'];                                
                playRate2 = championRatesJSON['Data'][champions[champIndex[1]]][role]['playRate'];
     
                if(playRate1 > playRate2)
                {
                    identifed.push(await getChampionByKey(champions[champIndex[0]]));
                    laneRates.splice(champIndex[0],1);
                    champions.splice(champIndex[0],1);
                    console.log(laneRates);
                }
                else{
                    identifed.push(await getChampionByKey(champions[champIndex[1]]));
                    laneRates.splice(champIndex[1],1);
                    champions.splice(champIndex[1],1);
                    console.log(laneRates);
                }

            }
        }
        


        



    }

    
    console.log(identifed.reverse());
    console.log(identifed);

    return identifed;
}

async function analyze(playerHistory,champions)
{
	let lanes = ["TOP","MID","BOTTOM","NONE"];
    let playersLaneRates = [];
    let laneRates;

	for(let i = 0; i < 4; i++)
	{
		let laneCnt = [0,0,0,0];
		let championCnt = 0;
		let roleCnt = 0;
        let numGames = 0;
       
		for(let match of playerHistory[i]['matches'])
		{
			let laneIndex = lanes.indexOf(match.lane);
			if(laneIndex > -1)
			{
				if(laneIndex < 2)
					laneCnt[laneIndex] += 1;
                else if(laneIndex == 2)
                {
					if(match.role == "DUO_SUPPORT")
						laneCnt[laneIndex+1] += 1;
					else
                        laneCnt[laneIndex] += 1;
                }
                else
                {
                    numGames--;
                }


            }
            else
                console.log("NONE");



            if(match.champion == champions[i])
                championCnt++;



			numGames++;

		}
		
        laneRates = laneCnt.map(x => (x/numGames));	
        playersLaneRates.push(laneRates);
        console.log(laneRates);
        console.log(await getChampionByKey(champions[i]) + ": " + championCnt);
        
        

		//playerLaneCnts.push(laneCnt);
    }
    

    return playersLaneRates;

}

function getPosition(laneIndex){
    switch(laneIndex)
    {
        case 3:
            return 'SUPPORT'
            break;
        case 2:
            return 'BOTTOM'
            break;
        case 1: 
            return 'MIDDLE'
            break;
        case 0:
            return 'TOP'
            break;
    }
}

function getRolesNoJungler(champions)
{

}





