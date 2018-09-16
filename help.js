const fs = require('fs');
const Discord = require('discord.js');

class Command{
    constructor(prefix, name, message, params = null,  online = false, aliases = null){
        aliases = new Set(aliases);
        params = new Set(params);
        this._command = {
                prefix : prefix,
                aliases : aliases,
                params : params,
                help :  message,
                online : online
            };
        this._name = name;
    }
    get command(){
        return this._command;
    }
    set command(theCommand){
        this._command = theCommand._command;
        this._name = theCommand._name;
    }
    get name(){
        return this._name;
    }
    set name(theName){
        this._name = theName;
    }
    get aliases(){
        return this._command.aliases;
    }
    set alias(theStr){
        this._command.aliases.add(theStr);
    }
    set aliases(theSet){
        this._command.aliases = theSet;
    }
    get help(){
        return this._command.help;
    }
    set help(theMsg){
        this._command.help = theMsg;
    }
    get online(){
        return this._command.online;
    }
    set online(status){
        this._command.online = status;
    }
    get prefix(){
        return this._command.prefix;
    }
    set prefix(thePrefix){
        this._command.prefix = thePrefix;
    }
    get params(){
        return this._command.params;
    }
    set param(param){
        this._command.params.add(param);
    }
    set params(theParams){
        this._command.params = theParams;
    }
    jsonFriendly(){
        let ob = {
            _command : this._command,
            _name : this._name
        };
        ob._command.aliases = [...ob._command.aliases];
        ob._command.params = [...ob._command.params];
        return ob;
    }
}


/*module.exports = */class HelpBot{
    constructor(configFile = null, github = '', msg = ''){
        if(!configFile)
            this._configFile = `${__dirname}/config.json`;
        else
            this._configFile = `${__dirname}/config_${configFile}.json`;
        this._generalMessage = msg;
        this._github = github;
        this._config = new Map();
    }
    saveConfig(){
        return new Promise((resolve, reject) => {
            let jsonCfg = new Map();
            this._config.forEach((v,k)=>{
                jsonCfg.set(k, v.jsonFriendly());
            });
            fs.writeFile(this._configFile, JSON.stringify({config:[...jsonCfg], github:this._github, generalMessage:this._generalMessage}, null, 4),{flag:'w'}, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }
    loadConfig(){
        return new Promise((resolve, reject) => {
            fs.readFile(this._configFile, 'utf-8', (err, data)=>{
                if (err){
                    if(err.code == 'ENOENT'){//the file doesn't exist, creating it, empty
                        this._config = new Map();
                        this.saveConfig().then(()=>{
                            resolve(this);
                        }).catch(e=>{
                            reject(e);
                        })
                    }else{
                        reject(err);
                    }
                }else{
                    try{
                        let d = JSON.parse(data)
                        this._github = d.github||this._github;
                        this._generalMessage = d.generalMessage||this._generalMessage;
                        this._config = new Map();
                        d.config.map( (elt) => {
                            let [tName, tCfg] = elt;
                            let tCmd = new Command(tCfg._command.prefix, tName, tCfg._command.help, tCfg._command.params, tCfg._command.online, tCfg._command.aliases);
                            this.command = tCmd;
                        });
                        resolve(this);
                    }catch(e){
                        //console.log(e,'ff');
                        this._github = '';
                        this._generalMessage = '';
                        this._config = new Map();
                        resolve(this);
                    }
                }
            });
        });
    }
    get config(){
        return this._config;
    }

    getCommand(theCmd){
        if(this._config.has(theCmd)){
            return new Command(theCmd, this._config.get(theCmd))
        }
        return false;
    }

    set command(cmd){
        if(cmd.name)
            this._config.set(cmd.name, cmd);
    }
    get github(){
        return this._github;
    }
    set github(theGH){
        this._github = theGH;
    }
    get message(){
        return this.capitalizeFirstLetter(this._generalMessage);
    }
    set message(theMsg){
        this._generalMessage = theMsg;
    }
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    generateFullHelp(){
        let fullHelp = `${this.message}\nRepo Github : ${this.github}\n`;
        this._config.forEach( (v,k)=>{
            fullHelp+=`**${v.prefix}${v.name}** : ${this.capitalizeFirstLetter(v.help)}\n`;
            if(v.params && v.params.size>0){
                fullHelp+=`Option${(v.params.size>1?'s':'')} : \n`;
                fullHelp+=` - ${[...v.params].join('\n - ')}\n`;
            }
            
        });
        return fullHelp;
    }
    generateDiscordHelp(){
        const fullHelp = new Discord.RichEmbed()
                .setTitle(`${this.message}`)
                .setURL(`${this.github}`)
                .setColor([Math.random()*255,Math.random()*255,Math.random()*255]);
        
        this._config.forEach( (v,k)=>{
            let opt = `${this.capitalizeFirstLetter(v.help)}`;
            if(v.params && v.params.size>0){
                opt+=`\n__Paramètre${(v.params.size>1?'s':'')}__ : \n`;
                opt+=` - ${[...v.params].join('\n - ')}\n`;
            }
            fullHelp.addField(`**${v.prefix}${v.name}**`, opt, true);

        });
        //console.log(fullHelp);
        return fullHelp;
    }
};

module.exports = {HelpBot:HelpBot,Command:Command};
/*
let structure = {
            command : {
                aliases : [],
                help : { message:"" },
                github : "",
                online : false
            },
            ...
}
*/

/*
let tt = new Command("µ","test","yolo",['param1'],'gh',true);
console.log(tt.help);
tt.help = "nope"
let g = new Set(['al2','al3']);
tt.alias = 'al1';
console.log(tt.aliases);
tt.aliases = g;
console.log(tt);

let hb = new HelpBot();
hb.loadConfig().then(cfg=>{
    console.log(cfg);
    console.log(hb);
   // hb.command = tt;
    //hb.saveConfig();
})
//hb.command = tt;
console.log(hb);
//hb.saveConfig();
*/
let allCmdsSudoku = [
    ['$','help','affiche l\'aide', [],true],
    ['$','solve','lance la résolution du sudoku', ['<lignes sans espaces séparées par |>'],true],
    ['$','draw','dessine un sudoku, valide ou non', ['<lignes sans espaces séparées par |>'],true],
    ['$','check','vérifie la validité d\'un sudoku', ['<lignes sans espaces séparées par |>'],true]];
let allCmdsMusic = [
    ['$','play', 'joue un extrait musical dans le channel audio dédié, vous avez 30 secondes pour trouver le nom de la chanson', [], true],
    ['$','lyrics',`écrit les paroles d'une chanson ligne par ligne, vous devez trouver le nom de la chanson avant la fin des paroles`, [], true],
    ['$','badtr',`écrit les paroles d'une chanson ligne par ligne, mais traduites par Google Translate, vous devez trouver le nom de la chanson avant la fin des paroles`, [], true],
    ['$','list','affiche la liste des morceaux disponibles', [], true],
    ['$','stop','arrête la partie en cours', [] ,true]
];

let allWeekly = [
    ['µ','p4','lance un puissance4 contre l\'IA', [],true],
    ['µ','p4tux','lance le puissance4 de tux contre l\'IA de ce bot', [],true],
    ['µ','img2ascii','transforme une image fixe en représentation ASCII, retourne une image PNG', ['fichier-joint : l\'image à transformer'],true],
    ['µ','img2txtfile','transforme une image fixe en représentation ASCII, retourne un fichier texte', ['fichier-joint : l\'image à transformer'],true],
    ['µ','gif2ascii','transforme une image animée en représentation ASCII, retourne un fichier GIF', ['fichier-joint : l\'image à transformer'],true],
    ['µ','nimvsIA','lance un jeu de NIM contre l\'IA (normalement assez intelligente)', ['mod : pour jouer avec la variante dans laquelle le perdant prend le dernier bâtonnet'],true],
    ['µ','nimvs','lance un jeu de NIM contre un adversaire', ['@mention : l\'adversaire à défier','mod : pour jouer avec la variante dans laquelle le perdant prend le dernier bâtonnet'],true],
    ['µ','nimvsIArandom','lance un jeu de NIM contre l\'IA qui joue au hasard', ['mod : pour jouer avec la variante dans laquelle le perdant prend le dernier bâtonnet'],true]
];

/*let hbSudo = new HelpBot('sudoku','https://github.com/aDotDotDot/sudokord', 'Un bot pour vous aider à résoudre des sudokus');
    for(let r of allCmdsSudoku){
        let j = new Command(...r);
        hbSudo.command = j
    }
    hbSudo.saveConfig();
    console.log(hbSudo);


let hbMusic = new HelpBot('musicbot','https://github.com/aDotDotDot/music-bot', 'un bot qui fait des blind-tests');
    for(let r of allCmdsMusic){
        let j = new Command(...r);
        hbMusic.command = j
    }
    hbMusic.saveConfig();
    console.log(hbMusic);*/
/*
let hbWeekly = new HelpBot('weekly','https://github.com/aDotDotDot/weekly', 'les défis de la semaine');
hbWeekly.loadConfig().then(cfg=>{
    for(let r of allWeekly){
        let j = new Command(...r);
        hbWeekly.command = j
    }
    //hbWeekly.saveConfig();
    console.log(hbWeekly);
    hbWeekly.generateFullHelp();
});*/
//let hbw = new HelpBot('weekly','https://github.com/aDotDotDot/weekly', 'les défis de la semaine');
/*for(let r of allWeekly){
    let j = new Command(...r);
    hbw.command = j
}*/
//hbw.loadConfig().then(()=>{
//    hbw.generateFullHelp();

//})
//hbw.saveConfig();