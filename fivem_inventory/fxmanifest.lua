fx_version 'cerulean'
game 'gta5'

author 'Ben'
description 'Simple Player Inventory System with MySQL Persistence'
version '2.0.0'

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server.lua'
}

client_scripts {
    'client.lua'
}

ui_page 'html/ui.html'

files {
    'html/ui.html',
    'html/style.css',
    'html/script.js'
}
