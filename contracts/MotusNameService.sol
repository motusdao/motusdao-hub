// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Motus Name Service
 * @notice Servicio de nombres descentralizado para MotusDAO
 * @dev Los nombres son NFTs transferibles que resuelven a direcciones
 * @author MotusDAO Team
 */
contract MotusNameService is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    // Precio de registro en cUSD (18 decimals) - 5 cUSD
    uint256 public registrationPrice = 5 * 10**18;
    
    // Dirección del token cUSD en Celo Mainnet
    address public constant CUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    
    // Mapping de nombre a dirección
    mapping(string => address) public nameToAddress;
    
    // Mapping de dirección a nombre principal
    mapping(address => string) public addressToPrimaryName;
    
    // Mapping de nombre a ID de token (NFT)
    mapping(string => uint256) public nameToTokenId;
    
    // Mapping de ID de token a nombre
    mapping(uint256 => string) public tokenIdToName;
    
    // Metadatos adicionales
    mapping(string => NameMetadata) public nameMetadata;
    
    struct NameMetadata {
        string avatar;
        string bio;
        string twitter;
        string discord;
        uint256 registeredAt;
        uint256 expiresAt; // 0 = never expires
    }
    
    event NameRegistered(string indexed name, address indexed owner, uint256 tokenId);
    event NameTransferred(string indexed name, address indexed from, address indexed to);
    event NameUpdated(string indexed name, address indexed newAddress);
    event MetadataUpdated(string indexed name);
    event PriceUpdated(uint256 newPrice);
    
    constructor() ERC721("Motus Name Service", "MNS") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }
    
    /**
     * @notice Registra un nuevo nombre .motus
     * @param name Nombre sin la extensión (ej: "juan" no "juan.motus")
     * @param targetAddress Dirección a la que apuntará el nombre
     */
    function registerName(string memory name, address targetAddress) external returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(name).length <= 32, "Name too long");
        require(isValidName(name), "Invalid name format");
        require(nameToAddress[name] == address(0), "Name already taken");
        require(targetAddress != address(0), "Invalid target address");
        
        // Transfer cUSD from user to contract
        IERC20(CUSD).transferFrom(msg.sender, address(this), registrationPrice);
        
        // Mint NFT
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(msg.sender, newTokenId);
        
        // Set mappings
        nameToAddress[name] = targetAddress;
        nameToTokenId[name] = newTokenId;
        tokenIdToName[newTokenId] = name;
        
        // Set as primary name if user doesn't have one
        if (bytes(addressToPrimaryName[msg.sender]).length == 0) {
            addressToPrimaryName[msg.sender] = name;
        }
        
        // Set metadata
        nameMetadata[name] = NameMetadata({
            avatar: "",
            bio: "",
            twitter: "",
            discord: "",
            registeredAt: block.timestamp,
            expiresAt: 0 // Never expires for now
        });
        
        emit NameRegistered(name, msg.sender, newTokenId);
        
        return newTokenId;
    }
    
    /**
     * @notice Resuelve un nombre a una dirección
     * @param name Nombre a resolver (sin .motus)
     * @return address Dirección asociada al nombre
     */
    function resolve(string memory name) external view returns (address) {
        return nameToAddress[name];
    }
    
    /**
     * @notice Lookup inverso: dirección a nombre principal
     * @param addr Dirección a buscar
     * @return string Nombre principal asociado a la dirección
     */
    function reverseLookup(address addr) external view returns (string memory) {
        return addressToPrimaryName[addr];
    }
    
    /**
     * @notice Actualiza la dirección de un nombre (solo owner del NFT)
     * @param name Nombre a actualizar
     * @param newAddress Nueva dirección
     */
    function updateNameAddress(string memory name, address newAddress) external {
        uint256 tokenId = nameToTokenId[name];
        require(tokenId != 0, "Name not registered");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(newAddress != address(0), "Invalid address");
        
        nameToAddress[name] = newAddress;
        emit NameUpdated(name, newAddress);
    }
    
    /**
     * @notice Actualiza los metadatos de un nombre
     */
    function updateMetadata(
        string memory name,
        string memory avatar,
        string memory bio,
        string memory twitter,
        string memory discord
    ) external {
        uint256 tokenId = nameToTokenId[name];
        require(tokenId != 0, "Name not registered");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        NameMetadata storage metadata = nameMetadata[name];
        metadata.avatar = avatar;
        metadata.bio = bio;
        metadata.twitter = twitter;
        metadata.discord = discord;
        
        emit MetadataUpdated(name);
    }
    
    /**
     * @notice Establece el nombre principal de un usuario
     */
    function setPrimaryName(string memory name) external {
        uint256 tokenId = nameToTokenId[name];
        require(tokenId != 0, "Name not registered");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        addressToPrimaryName[msg.sender] = name;
    }
    
    /**
     * @notice Valida el formato de un nombre
     * @dev Permite: letras minúsculas, números, guiones
     */
    function isValidName(string memory name) public pure returns (bool) {
        bytes memory nameBytes = bytes(name);
        
        for (uint i = 0; i < nameBytes.length; i++) {
            bytes1 char = nameBytes[i];
            
            // Permitir: a-z, 0-9, guión (-)
            bool isLowercase = (char >= 0x61 && char <= 0x7A); // a-z
            bool isNumber = (char >= 0x30 && char <= 0x39);    // 0-9
            bool isHyphen = (char == 0x2D);                     // -
            
            if (!isLowercase && !isNumber && !isHyphen) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @notice Verifica si un nombre está disponible
     */
    function isAvailable(string memory name) external view returns (bool) {
        return nameToAddress[name] == address(0);
    }
    
    /**
     * @notice Owner puede actualizar el precio de registro
     */
    function setRegistrationPrice(uint256 newPrice) external onlyOwner {
        registrationPrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    /**
     * @notice Owner puede retirar fondos acumulados
     */
    function withdraw() external onlyOwner {
        uint256 balance = IERC20(CUSD).balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        IERC20(CUSD).transfer(owner(), balance);
    }
    
    /**
     * @notice Retorna el total de nombres registrados
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @notice Override para actualizar mappings cuando se transfiere NFT
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        // Si se transfiere el NFT, actualizar el mapping de nombre principal
        string memory name = tokenIdToName[tokenId];
        if (bytes(addressToPrimaryName[from]).length > 0 && 
            keccak256(bytes(addressToPrimaryName[from])) == keccak256(bytes(name))) {
            delete addressToPrimaryName[from];
        }
        
        // El nuevo owner puede establecerlo como su nombre principal
        if (to != address(0) && bytes(addressToPrimaryName[to]).length == 0) {
            addressToPrimaryName[to] = name;
        }
        
        if (from != address(0)) {
            emit NameTransferred(name, from, to);
        }
        
        return from;
    }
    
    /**
     * @notice Retorna el URI del token (metadata del NFT)
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        string memory name = tokenIdToName[tokenId];
        NameMetadata memory metadata = nameMetadata[name];
        
        // Construir JSON metadata on-chain
        string memory json = string(abi.encodePacked(
            '{"name": "',
            name,
            '.motus", "description": "Motus Name Service - Decentralized naming for MotusDAO", "image": "',
            bytes(metadata.avatar).length > 0 ? metadata.avatar : "https://motusdao.com/mns-default.png",
            '", "attributes": [{"trait_type": "Name", "value": "',
            name,
            '"}, {"trait_type": "Registered", "value": "',
            metadata.registeredAt.toString(),
            '"}]}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", _base64Encode(bytes(json))));
    }
    
    /**
     * @notice Encode base64 simple (para metadata on-chain)
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        
        bytes memory result = new bytes(encodedLen);
        
        uint256 i = 0;
        uint256 j = 0;
        
        for (; i + 2 < data.length; i += 3) {
            result[j++] = bytes(table)[uint8(data[i] >> 2)];
            result[j++] = bytes(table)[uint8(((data[i] & 0x03) << 4) | (data[i+1] >> 4))];
            result[j++] = bytes(table)[uint8(((data[i+1] & 0x0f) << 2) | (data[i+2] >> 6))];
            result[j++] = bytes(table)[uint8(data[i+2] & 0x3f)];
        }
        
        if (i < data.length) {
            result[j++] = bytes(table)[uint8(data[i] >> 2)];
            if (i + 1 < data.length) {
                result[j++] = bytes(table)[uint8(((data[i] & 0x03) << 4) | (data[i+1] >> 4))];
                result[j++] = bytes(table)[uint8((data[i+1] & 0x0f) << 2)];
            } else {
                result[j++] = bytes(table)[uint8((data[i] & 0x03) << 4)];
                result[j++] = "=";
            }
            result[j++] = "=";
        }
        
        return string(result);
    }
}

// Interface ERC20 básica
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}




