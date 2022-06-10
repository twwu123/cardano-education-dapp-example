import * as CardanoWasm from "@emurgo/cardano-serialization-lib-browser";
import * as utils from "./utils.js"
import { Buffer } from "buffer";
import axios from "axios";

const yoroiBackendUrl = "https://testnet-backend.yoroiwallet.com/api"

const onScreenAlert = document.querySelector("#on-screen-alert")

const accessButton = document.querySelector("#access-button")
const isEnabledButton = document.querySelector("#is-enabled-button")
const getAccountBalanceButton = document.querySelector("#get-account-balance-button")
const getUnusedAddressesButton = document.querySelector("#get-unused-addresses-button")
const getUsedAddressesButton = document.querySelector("#get-used-addresses-button")
const getChangeAddressButton = document.querySelector("#get-change-address-button")
const getRewardAddressesButton = document.querySelector("#get-reward-addresses-button")
const getUTXOsButton = document.querySelector("#get-utxos-button")
const getCollateralUTXOsButton = document.querySelector("#get-collateral-utxos-button")
const signSendNFTToScriptButton = document.querySelector("#sign-send-nft-to-script-button")
const signRedeemNFTFromScriptButton = document.querySelector("#sign-redeem-nft-from-script-button")
const submitTxButton = document.querySelector("#submit-tx-button")

let api
let signedTx
let txHash

accessButton.addEventListener('click', () => {
    if (!window.cardano.yoroi) {
        alert("Yoroi wallet not found! Please install it")
        return
    }
    window.cardano.yoroi.enable()
        .then((yoroiApi) => {
            api = yoroiApi
            accessButton.className = "d-none"
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
})

isEnabledButton.addEventListener('click', () => {
    window.cardano.yoroi.isEnabled()
        .then((enabled) => {
            setOnScreenAlert(enabled, "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
})

getAccountBalanceButton.addEventListener('click', () => {
    checkApiAvailable()
    api.getBalance()
        .then((hexBalance) => {
            const wasmValue = CardanoWasm.Value.from_bytes(utils.hexToBytes(hexBalance))
            const adaValue = wasmValue.coin().to_str()
            const assetValue = wasmMultiassetToJSONs(wasmValue.multiasset())
            setOnScreenAlert(`ADA: ${adaValue} Assets: ${JSON.stringify(assetValue)}`, "success")
        })
})

getUnusedAddressesButton.addEventListener('click', () => {
    checkApiAvailable()
    api.getUnusedAddresses()
        .then((hexAddresses) => {
            const addresses = []
            for (let i = 0; i < hexAddresses.length; i++) {
                const wasmAddress = CardanoWasm.Address.from_bytes(utils.hexToBytes(hexAddresses[i]))
                addresses.push(wasmAddress.to_bech32())
            }
            setOnScreenAlert(addresses, "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
})

getUsedAddressesButton.addEventListener('click', () => {
    checkApiAvailable()
    api.getUsedAddresses({ page: 0, limit: 5 })
        .then((hexAddresses) => {
            const addresses = []
            for (let i = 0; i < hexAddresses.length; i++) {
                const wasmAddress = CardanoWasm.Address.from_bytes(utils.hexToBytes(hexAddresses[i]))
                addresses.push(wasmAddress.to_bech32())
            }
            setOnScreenAlert(addresses, "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
})

getChangeAddressButton.addEventListener('click', () => {
    checkApiAvailable()
    api.getChangeAddress()
        .then((hexAddress) => {
            const wasmAddress = CardanoWasm.Address.from_bytes(utils.hexToBytes(hexAddress))
            setOnScreenAlert(wasmAddress.to_bech32(), "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
})

getRewardAddressesButton.addEventListener('click', () => {
    checkApiAvailable()
    api.getRewardAddresses()
        .then((hexAddresses) => {
            const addresses = []
            for (let i = 0; i < hexAddresses.length; i++) {
                const wasmAddress = CardanoWasm.Address.from_bytes(utils.hexToBytes(hexAddresses[i]))
                addresses.push(wasmAddress.to_bech32())
            }
            setOnScreenAlert(addresses, "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
})

getUTXOsButton.addEventListener('click', () => {
    checkApiAvailable()
    api.getUtxos()
        .then((hexUtxos) => {
            let utxos = []
            for (let i = 0; i < hexUtxos.length; i++) {
                const utxo = {}
                const wasmUtxo = CardanoWasm.TransactionUnspentOutput.from_bytes(utils.hexToBytes(hexUtxos[i]))
                const output = wasmUtxo.output()
                const input = wasmUtxo.input()
                utxo.tx_hash = utils.bytesToHex(input.transaction_id().to_bytes())
                utxo.tx_index = input.index()
                utxo.receiver = output.address().to_bech32()
                utxo.amount = output.amount().coin().to_str()
                utxo.asset = wasmMultiassetToJSONs(output.amount().multiasset())
                utxos.push(JSON.stringify(utxo))
            }
            setOnScreenAlert(utxos, "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
})

getCollateralUTXOsButton.addEventListener('click', () => {
    checkApiAvailable()
    api.getCollateral(2000000)
        .then((hexUtxos) => {
            let utxos = []
            for (let i = 0; i < hexUtxos.length; i++) {
                const utxo = {}
                const wasmUtxo = CardanoWasm.TransactionUnspentOutput.from_bytes(utils.hexToBytes(hexUtxos[i]))
                const output = wasmUtxo.output()
                const input = wasmUtxo.input()
                utxo.tx_hash = utils.bytesToHex(input.transaction_id().to_bytes())
                utxo.tx_index = input.index()
                utxo.receiver = output.address().to_bech32()
                utxo.amount = output.amount().coin().to_str()
                utxo.asset = wasmMultiassetToJSONs(output.amount().multiasset())
                utxos.push(JSON.stringify(utxo))
            }
            setOnScreenAlert(utxos, "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
})

signSendNFTToScriptButton.addEventListener('click', async () => {
    checkApiAvailable()
    const txBuilder = getTxBuilder()
    const hexUtxos = await api.getUtxos("2000000")

    // this key hash is needed as part of our policy Id
    let wasmKeyHash

    // add utxos for amount
    const txInputsBuilder = CardanoWasm.TxInputsBuilder.new()
    for (let i = 0; i < hexUtxos.length; i++) {
        const wasmUtxo = CardanoWasm.TransactionUnspentOutput.from_bytes(utils.hexToBytes(hexUtxos[i]))
        txInputsBuilder.add_input(wasmUtxo.output().address(), wasmUtxo.input(), wasmUtxo.output().amount())
        if (i == 0) {
            wasmKeyHash = CardanoWasm.BaseAddress.from_address(wasmUtxo.output().address()).payment_cred().to_keyhash()
        }
    }
    txBuilder.set_inputs(txInputsBuilder)

    // handle asset amounts
    const wasmPubkeyScript = CardanoWasm.ScriptPubkey.new(wasmKeyHash)
    const wasmNativeScript = CardanoWasm.NativeScript.new_script_pubkey(wasmPubkeyScript)
    const wasmAssetName = CardanoWasm.AssetName.new(Buffer.from("NFT1", "utf8"))
    const wasmAssets = CardanoWasm.Assets.new()
    wasmAssets.insert(wasmAssetName, CardanoWasm.BigNum.from_str('1'))
    const wasmMultiasset = CardanoWasm.MultiAsset.new()
    wasmMultiasset.insert(wasmNativeScript.hash(), wasmAssets)
    const wasmValue = CardanoWasm.Value.new_from_assets(wasmMultiasset)
    wasmValue.set_coin(CardanoWasm.BigNum.from_str("3000000"))

    // build and add output
    const wasmScriptAddress = CardanoWasm.Address.from_bech32("addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8")
    const outputToScript = CardanoWasm.TransactionOutput.new(wasmScriptAddress, wasmValue)
    outputToScript.set_data_hash(CardanoWasm.hash_plutus_data(CardanoWasm.PlutusData.new_integer(CardanoWasm.BigInt.from_str("42"))))
    txBuilder.add_output(outputToScript)

    // this adds a witness for minting asset
    txBuilder.add_mint_asset(wasmNativeScript, wasmAssetName, CardanoWasm.Int.new_i32(1))

    // add metadata
    const metaDataObj = {
        [utils.bytesToHex(wasmNativeScript.hash().to_bytes())]: {
            "NFT1": {
                description: "NFT For testing",
                name: "Test NFT",
                id: 0,
                image: "https://google.com"
            }
        }
    }

    txBuilder.add_json_metadatum(CardanoWasm.BigNum.from_str("721"), JSON.stringify(metaDataObj))

    // handle change
    const changeAddress = await api.getChangeAddress()
    const wasmChangeAddress = CardanoWasm.Address.from_bytes(utils.hexToBytes(changeAddress))
    txBuilder.add_change_if_needed(wasmChangeAddress)

    const wasmUnsignedTransaction = txBuilder.build_tx()

    api.signTx(utils.bytesToHex(wasmUnsignedTransaction.to_bytes()))
        .then((witnessHex) => {
            const wasmWitnessSet = CardanoWasm.TransactionWitnessSet.from_bytes(utils.hexToBytes(witnessHex))
            const signedTransaction = CardanoWasm.Transaction.new(wasmUnsignedTransaction.body(), wasmWitnessSet, wasmUnsignedTransaction.auxiliary_data())
            signedTx = utils.bytesToHex(signedTransaction.to_bytes())
            txHash = utils.bytesToHex(CardanoWasm.hash_transaction(wasmUnsignedTransaction.body()).to_bytes())
            setOnScreenAlert(signedTx, "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
        .finally(() => {
            txBuilder.free()
        })
})

signRedeemNFTFromScriptButton.addEventListener('click', async () => {
    checkApiAvailable()
    const txBuilder = getTxBuilder()

    // query transaction
    if (!txHash) {
        setOnScreenAlert("Please send NFT to script")
        return
    }
    const scriptTx = await axios.post(
        `${yoroiBackendUrl}/v2/txs/get`,
        {
            txHashes: [txHash]
        }
    )

    const txInputsBuilder = CardanoWasm.TxInputsBuilder.new()
    const scriptTxOutputs = scriptTx.data[txHash].outputs
    for (let i = 0; i < scriptTxOutputs.length; i++) {
        const output = scriptTxOutputs[i]
        if (output.address == "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8") {
            // handle plutus witness
            const wasmPlutusScript = CardanoWasm.PlutusScript.from_bytes(utils.hexToBytes("4e4d01000033222220051200120011"))
            const wasmDatum = CardanoWasm.PlutusData.new_integer(CardanoWasm.BigInt.from_str('42'))
            const wasmRedemer = CardanoWasm.Redeemer.new(
                CardanoWasm.RedeemerTag.new_spend(),
                CardanoWasm.BigNum.zero(),
                CardanoWasm.PlutusData.new_integer(CardanoWasm.BigInt.from_str("42")),
                CardanoWasm.ExUnits.new(
                    CardanoWasm.BigNum.from_str('1700'),
                    CardanoWasm.BigNum.from_str('476468'),
                ),
            )
            const wasmPlutusWitness = CardanoWasm.PlutusWitness.new(wasmPlutusScript, wasmDatum, wasmRedemer)

            // handle assets
            const wasmTransactionInput = CardanoWasm.TransactionInput.new(CardanoWasm.TransactionHash.from_bytes(utils.hexToBytes(txHash), i))
            const assets = output.assets
            const wasmMultiasset = CardanoWasm.MultiAsset.new()
            for (let i = 0; i < assets.length; i++) {
                const wasmAssets = CardanoWasm.Assets.new()
                wasmAssets.insert(CardanoWasm.AssetName.new(utils.hexToBytes(assets[i].name)), CardanoWasm.BigNum.from_str(assets[i].amount))
                const wasmScriptHash = CardanoWasm.ScriptHash.from_bytes(utils.hexToBytes(assets[i].policyId))
                wasmMultiasset.insert(wasmScriptHash, wasmAssets)
            }
            const wasmValue = CardanoWasm.Value.new_from_assets(wasmMultiasset)
            wasmValue.set_coin(CardanoWasm.BigNum.from_str(output.amount))

            // add plutus input
            txInputsBuilder.add_plutus_script_input(wasmPlutusWitness, wasmTransactionInput, wasmValue)
        }
    }
    txBuilder.set_inputs(txInputsBuilder)


    // handle collateral inputs
    const collateralTxInputsBuilder = CardanoWasm.TxInputsBuilder.new()
    const hexCollateralUtxos = await api.getCollateral(3000000)
    for (let i = 0; i < hexCollateralUtxos.length; i++) {
        const wasmUtxo = CardanoWasm.TransactionUnspentOutput.from_bytes(utils.hexToBytes(hexCollateralUtxos[i]))
        collateralTxInputsBuilder.add_input(wasmUtxo.output().address(), wasmUtxo.input(), wasmUtxo.output().amount())
    }
    txBuilder.set_collateral(collateralTxInputsBuilder)
    txBuilder.calc_script_data_hash(CardanoWasm.TxBuilderConstants.plutus_default_cost_models())

    // handle change
    const changeAddress = await api.getChangeAddress()
    const wasmChangeAddress = CardanoWasm.Address.from_bytes(utils.hexToBytes(changeAddress))
    txBuilder.add_change_if_needed(wasmChangeAddress)

    const wasmUnsignedTransaction = txBuilder.build_tx()

    api.signTx(utils.bytesToHex(wasmUnsignedTransaction.to_bytes()))
        .then((witnessHex) => {
            const wasmWitnessSet = CardanoWasm.TransactionWitnessSet.from_bytes(utils.hexToBytes(witnessHex))
            const signedTransaction = CardanoWasm.Transaction.new(wasmUnsignedTransaction.body(), wasmWitnessSet, wasmUnsignedTransaction.auxiliary_data())
            signedTx = utils.bytesToHex(signedTransaction.to_bytes())
            txHash = utils.bytesToHex(CardanoWasm.hash_transaction(wasmUnsignedTransaction.body()).to_bytes())
            setOnScreenAlert(signedTx, "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
        .finally(() => {
            txBuilder.free()
        })

})

submitTxButton.addEventListener('click', () => {
    checkApiAvailable()
    if (!signedTx) {
        setOnScreenAlert("Please Sign a Tx", "danger")
    }
    api.submitTx(signedTx)
        .then((txId) => {
            setOnScreenAlert(`Tx successfully submitted: ${txId}`, "success")
        })
        .catch((e) => {
            console.log(e)
            setOnScreenAlert(JSON.stringify(e), "danger")
        })
})

const getTxBuilder = () => {
    return CardanoWasm.TransactionBuilder.new(
        CardanoWasm.TransactionBuilderConfigBuilder.new()
            // all of these are taken from the mainnet genesis settings
            // linear fee parameters (a*size + b)
            .fee_algo(
                CardanoWasm.LinearFee.new(
                    CardanoWasm.BigNum.from_str("44"),
                    CardanoWasm.BigNum.from_str("155381")
                )
            )
            .coins_per_utxo_word(CardanoWasm.BigNum.from_str('34482'))
            .pool_deposit(CardanoWasm.BigNum.from_str('500000000'))
            .key_deposit(CardanoWasm.BigNum.from_str('2000000'))
            .ex_unit_prices(CardanoWasm.ExUnitPrices.new(
                CardanoWasm.UnitInterval.new(CardanoWasm.BigNum.from_str("721"), CardanoWasm.BigNum.from_str("10000000")),
                CardanoWasm.UnitInterval.new(CardanoWasm.BigNum.from_str("577"), CardanoWasm.BigNum.from_str("10000"))
            ))
            .max_value_size(5000)
            .max_tx_size(16384)
            .build()
    );
}

const wasmMultiassetToJSONs = (wasmMultiasset) => {
    let assetValue = []
    const wasmScriptHashes = wasmMultiasset?.keys()
    for (let i = 0; i < wasmScriptHashes?.len(); i++) {
        const wasmAssets = wasmMultiasset.get(wasmScriptHashes.get(i))
        const wasmAssetNames = wasmAssets.keys()
        const assetsJSON = {}
        for (let j = 0; j < wasmAssetNames.len(); j++) {
            const wasmAssetName = wasmAssetNames.get(j)
            const policyId = utils.bytesToHex(wasmScriptHashes.get(i).to_bytes())
            const name = utils.bytesToHex(wasmAssetName.to_bytes())
            assetsJSON[`${policyId}.${name}`] = wasmAssets.get(wasmAssetName).to_str()
        }
        assetValue.push(assetsJSON)
    }
    return assetValue
}

const checkApiAvailable = () => {
    if (!api) {
        setOnScreenAlert("Please request access", "danger")
        throw "Access not available"
    }
}

const setOnScreenAlert = (text, type) => {
    onScreenAlert.className = `alert alert-${type} w-100 overflow-auto`
    if (Array.isArray(text)) {
        for (let i = 0; i < text.length; i++) {
            text[i] += " \n"
        }
    }
    onScreenAlert.textContent = text
}