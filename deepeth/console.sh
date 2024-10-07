geth --datadir ./ --nodiscover --rpc --rpcaddr 0.0.0.0 --rpcport 8545 --rpccorsdomain "*" --rpcapi "eth,personal,net,web3" --port 30303 --networkid 4505 console 2>./output.log --allow-insecure-unlock
