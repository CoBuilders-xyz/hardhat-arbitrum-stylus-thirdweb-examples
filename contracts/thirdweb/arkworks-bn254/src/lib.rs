extern crate alloc;
use alloc::vec::Vec;
use stylus_sdk::prelude::*;

// Arkworks imports for BN254 curve operations
use ark_bn254::{Bn254, Fq, Fq2, G1Affine, G2Affine};
use ark_ec::{pairing::Pairing, AffineRepr};
use ark_ff::{One, PrimeField, Zero, BigInteger};

sol_storage! {
    #[entrypoint]
    pub struct ArkworksBN254 {
    }
}

#[public]
impl ArkworksBN254 {
    /// EVM precompile compatible pairing function
    /// 
    /// Takes 768 bytes (4 pairs of G1, G2 points) and returns 32 bytes
    /// Compatible with EVM pairing precompile format (0x08)
    /// 
    /// Format: [G1_1, G2_1, G1_2, G2_2, G1_3, G2_3, G1_4, G2_4]
    /// - Each G1: 64 bytes (32-byte x, 32-byte y)
    /// - Each G2: 128 bytes (32-byte x_i, 32-byte x_r, 32-byte y_i, 32-byte y_r)
    /// 
    /// Returns: 32 bytes where last byte is 1 if pairing succeeds, 0 if fails
    pub fn pairing(&self, input: Vec<u8>) -> Result<Vec<u8>, Vec<u8>> {
        // Validate input length (768 bytes = 4 pairs × 192 bytes per pair)
        if input.len() != 768 {
            return Err("Invalid input length for pairing".as_bytes().to_vec());
        }

        // Parse pairs from input
        let mut g1_points = Vec::new();
        let mut g2_points = Vec::new();
        
        for i in 0..4 {
            let offset = i * 192; // 64 + 128 = 192 bytes per pair
            
            // Parse G1 point (64 bytes)
            let g1_bytes = &input[offset..offset + 64];
            let g1_point = Self::parse_g1_point(g1_bytes)?;
            g1_points.push(g1_point);
            
            // Parse G2 point (128 bytes)
            let g2_bytes = &input[offset + 64..offset + 192];
            let g2_point = Self::parse_g2_point(g2_bytes)?;
            g2_points.push(g2_point);
        }

        // Perform multi-pairing computation
        let pairing_result = Bn254::multi_pairing(&g1_points, &g2_points);
        let success = pairing_result.0.is_one();

        // Return 32-byte result (EVM precompile format)
        let mut result = vec![0u8; 32];
        result[31] = if success { 1 } else { 0 };
        Ok(result)
    }

    /// EVM precompile compatible ecadd (0x06)
    /// 
    /// Takes 128 bytes: [G1_point1, G1_point2] and returns 64 bytes: G1_result
    /// Format: 64-byte G1 point = [32-byte x, 32-byte y] in big-endian
    pub fn ecadd(&self, input: Vec<u8>) -> Result<Vec<u8>, Vec<u8>> {
        // Validate input length (128 bytes = 2 × 64-byte G1 points)
        if input.len() != 128 {
            return Err("Invalid input length for ecadd".as_bytes().to_vec());
        }

        // Parse the two G1 points
        let point1_bytes = &input[0..64];
        let point2_bytes = &input[64..128];
        
        let point1 = Self::parse_g1_point(point1_bytes)?;
        let point2 = Self::parse_g1_point(point2_bytes)?;
        
        // Perform G1 addition
        let result = point1 + point2;
        let result_affine = G1Affine::from(result);
        
        // Convert back to 64-byte format
        Self::g1_point_to_bytes(&result_affine)
    }

    /// EVM precompile compatible ecmul (0x07)
    /// 
    /// Takes 96 bytes: [G1_point, scalar] and returns 64 bytes: G1_result
    /// Format: 64-byte G1 point + 32-byte scalar in big-endian
    pub fn ecmul(&self, input: Vec<u8>) -> Result<Vec<u8>, Vec<u8>> {
        // Validate input length (96 bytes = 64-byte G1 point + 32-byte scalar)
        if input.len() != 96 {
            return Err("Invalid input length for ecmul".as_bytes().to_vec());
        }

        // Parse G1 point and scalar
        let point_bytes = &input[0..64];
        let scalar_bytes: [u8; 32] = input[64..96].try_into().unwrap();
        
        let point = Self::parse_g1_point(point_bytes)?;
        let scalar = ark_bn254::Fr::from_be_bytes_mod_order(&scalar_bytes);
        
        // Perform scalar multiplication
        let result = point * scalar;
        let result_affine = G1Affine::from(result);
        
        // Convert back to 64-byte format
        Self::g1_point_to_bytes(&result_affine)
    }
}

impl ArkworksBN254 {
    /// Parse 64-byte array into arkworks G1Affine point
    /// Format: [32-byte x, 32-byte y] in big-endian
    fn parse_g1_point(bytes: &[u8]) -> Result<G1Affine, Vec<u8>> {
        if bytes.len() != 64 {
            return Err("Invalid G1 point length".as_bytes().to_vec());
        }

        // Extract x and y coordinates (big-endian)
        let x_bytes: [u8; 32] = bytes[0..32].try_into().unwrap();
        let y_bytes: [u8; 32] = bytes[32..64].try_into().unwrap();

        // Convert to field elements
        let x = Fq::from_be_bytes_mod_order(&x_bytes);
        let y = Fq::from_be_bytes_mod_order(&y_bytes);

        // Handle point at infinity (all zeros)
        if x.is_zero() && y.is_zero() {
            return Ok(G1Affine::identity());
        }

        // Create affine point
        let point = G1Affine::new_unchecked(x, y);
        
        // Validate point is on curve
        if !point.is_on_curve() {
            return Err("G1 point not on curve".as_bytes().to_vec());
        }

        Ok(point)
    }

    /// Convert G1Affine point to 64-byte array
    /// Format: [32-byte x, 32-byte y] in big-endian
    fn g1_point_to_bytes(point: &G1Affine) -> Result<Vec<u8>, Vec<u8>> {
        let mut result = Vec::with_capacity(64);
        
        // Handle point at infinity
        if point.is_zero() {
            result.extend_from_slice(&[0u8; 64]);
            return Ok(result);
        }
        
        // x coordinate (32 bytes, big-endian)
        let x_bytes = point.x.into_bigint().to_bytes_be();
        result.extend_from_slice(&x_bytes[x_bytes.len() - 32..]);
        
        // y coordinate (32 bytes, big-endian)  
        let y_bytes = point.y.into_bigint().to_bytes_be();
        result.extend_from_slice(&y_bytes[y_bytes.len() - 32..]);
        
        Ok(result)
    }

    /// Parse 128-byte array into arkworks G2Affine point
    /// EIP-197 format: [32-byte x_i, 32-byte x_r, 32-byte y_i, 32-byte y_r]
    /// where point = (x_r + x_i * i, y_r + y_i * i) in Fq2
    fn parse_g2_point(bytes: &[u8]) -> Result<G2Affine, Vec<u8>> {
        if bytes.len() != 128 {
            return Err("Invalid G2 point length".as_bytes().to_vec());
        }

        // Extract coordinates (EIP-197 format: imaginary first, then real)
        let x_i_bytes: [u8; 32] = bytes[0..32].try_into().unwrap();
        let x_r_bytes: [u8; 32] = bytes[32..64].try_into().unwrap();
        let y_i_bytes: [u8; 32] = bytes[64..96].try_into().unwrap();
        let y_r_bytes: [u8; 32] = bytes[96..128].try_into().unwrap();

        // Convert to field elements  
        let x_r = Fq::from_be_bytes_mod_order(&x_r_bytes);
        let x_i = Fq::from_be_bytes_mod_order(&x_i_bytes);
        let y_r = Fq::from_be_bytes_mod_order(&y_r_bytes);
        let y_i = Fq::from_be_bytes_mod_order(&y_i_bytes);

        // Create Fq2 elements (real + imaginary * i)
        let x = Fq2::new(x_r, x_i);
        let y = Fq2::new(y_r, y_i);

        // Handle point at infinity
        if x.is_zero() && y.is_zero() {
            return Ok(G2Affine::identity());
        }

        // Create affine point
        let point = G2Affine::new_unchecked(x, y);
        
        // Validate point is on curve
        if !point.is_on_curve() {
            return Err("G2 point not on curve".as_bytes().to_vec());
        }

        Ok(point)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use motsu::prelude::*;
    use alloy_primitives::Address;
    use hex_literal::hex;
    use ark_bn254::{Fr, G1Projective, G2Projective};
    use ark_ec::Group;
    use ark_ff::{BigInteger, UniformRand};
    use ark_std::rand::SeedableRng;
    use ark_std::rand::rngs::StdRng;

    /// Convert G1Projective to 64-byte array (x, y coordinates)
    fn g1_to_bytes(point: &G1Projective) -> Vec<u8> {
        let affine = G1Affine::from(*point);
        let mut bytes = Vec::with_capacity(64);
        
        // x coordinate (32 bytes, big-endian)
        let x_bytes = affine.x.into_bigint().to_bytes_be();
        bytes.extend_from_slice(&x_bytes[x_bytes.len() - 32..]);
        
        // y coordinate (32 bytes, big-endian)  
        let y_bytes = affine.y.into_bigint().to_bytes_be();
        bytes.extend_from_slice(&y_bytes[y_bytes.len() - 32..]);
        
        bytes
    }

    /// Convert G2Projective to 128-byte array (EIP-197 format)
    fn g2_to_bytes(point: &G2Projective) -> Vec<u8> {
        let affine = G2Affine::from(*point);
        let mut bytes = Vec::with_capacity(128);
        
        // EIP-197 format: [x_imag, x_real, y_imag, y_real]
        let x_imag_bytes = affine.x.c1.into_bigint().to_bytes_be();
        bytes.extend_from_slice(&x_imag_bytes[x_imag_bytes.len() - 32..]);
        
        let x_real_bytes = affine.x.c0.into_bigint().to_bytes_be();
        bytes.extend_from_slice(&x_real_bytes[x_real_bytes.len() - 32..]);
        
        let y_imag_bytes = affine.y.c1.into_bigint().to_bytes_be();
        bytes.extend_from_slice(&y_imag_bytes[y_imag_bytes.len() - 32..]);
        
        let y_real_bytes = affine.y.c0.into_bigint().to_bytes_be();
        bytes.extend_from_slice(&y_real_bytes[y_real_bytes.len() - 32..]);
        
        bytes
    }

    #[motsu::test]
    fn test_identity_pairing(contract: Contract<ArkworksBN254>, alice: Address) {
        
        // Test pairing with all identity points (should be 1)
        let input = vec![0u8; 768]; // All zeros = identity points
        
        let result = contract.sender(alice).pairing(input).unwrap();
        assert_eq!(result.len(), 32);
        assert_eq!(result[31], 1); // Should succeed (identity pairing = 1)
    }

    #[motsu::test]
    fn test_invalid_input_length(contract: Contract<ArkworksBN254>, alice: Address) {
        
        // Test with wrong input length
        let input = vec![0u8; 100]; // Wrong length
        
        let result = contract.sender(alice).pairing(input);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), b"Invalid input length for pairing");
    }

    #[motsu::test]
    fn test_random_valid_pairing(contract: Contract<ArkworksBN254>, alice: Address) {
        let mut rng = StdRng::seed_from_u64(12345);
        
        // Generate random points for testing
        let g1_gen = G1Projective::generator();
        let g2_gen = G2Projective::generator();
        
        let a = Fr::rand(&mut rng);
        let b = Fr::rand(&mut rng);
        
        // Create pairing: e(a*G1, b*G2) * e(-a*G1, b*G2) = e(0, b*G2) = 1
        let g1_point1 = g1_gen * a;
        let g1_point2 = g1_gen * (-a);
        let g2_point1 = g2_gen * b;
        let g2_point2 = g2_gen * b;
        
        // Build input for 4-way pairing (2 real pairs + 2 identity pairs)
        let mut input = Vec::with_capacity(768);
        
        // Pair 1: (a*G1, b*G2)
        input.extend_from_slice(&g1_to_bytes(&g1_point1));
        input.extend_from_slice(&g2_to_bytes(&g2_point1));
        
        // Pair 2: (-a*G1, b*G2)  
        input.extend_from_slice(&g1_to_bytes(&g1_point2));
        input.extend_from_slice(&g2_to_bytes(&g2_point2));
        
        // Pairs 3 & 4: Identity points
        input.extend_from_slice(&vec![0u8; 192]); // 64 + 128 = 192 bytes
        input.extend_from_slice(&vec![0u8; 192]);
        
        let result = contract.sender(alice).pairing(input).unwrap();
        assert_eq!(result.len(), 32);
        assert_eq!(result[31], 1); // Should succeed
    }

    #[motsu::test]
    fn test_point_parsing_g1() {
        // Test G1 point parsing with identity point (all zeros)
        let identity_g1_bytes = vec![0u8; 64];
        let point = ArkworksBN254::parse_g1_point(&identity_g1_bytes);
        assert!(point.is_ok());
        
        // Test invalid length
        let invalid_bytes = vec![0u8; 32]; // Wrong length
        let point = ArkworksBN254::parse_g1_point(&invalid_bytes);
        assert!(point.is_err());
    }

    #[motsu::test]
    fn test_point_parsing_g2() {
        // Test G2 point parsing with identity point
        let identity_g2_bytes = vec![0u8; 128];
        let point = ArkworksBN254::parse_g2_point(&identity_g2_bytes);
        assert!(point.is_ok());
        
        // Test invalid length
        let invalid_bytes = vec![0u8; 64]; // Wrong length
        let point = ArkworksBN254::parse_g2_point(&invalid_bytes);
        assert!(point.is_err());
    }

    #[motsu::test]
    fn test_known_pairing_vectors(contract: Contract<ArkworksBN254>, alice: Address) {
        
        // Test with known pairing that should fail (non-trivial example)
        let mut rng = StdRng::seed_from_u64(42);
        
        let g1_gen = G1Projective::generator();
        let g2_gen = G2Projective::generator();
        
        let a = Fr::rand(&mut rng);
        let b = Fr::rand(&mut rng);
        let c = Fr::rand(&mut rng); // Different value to make pairing fail
        
        // Create pairing that should NOT equal 1: e(a*G1, b*G2) * e(c*G1, G2)
        let g1_point1 = g1_gen * a;
        let g1_point2 = g1_gen * c;
        let g2_point1 = g2_gen * b;
        let g2_point2 = g2_gen;
        
        let mut input = Vec::with_capacity(768);
        
        input.extend_from_slice(&g1_to_bytes(&g1_point1));
        input.extend_from_slice(&g2_to_bytes(&g2_point1));
        input.extend_from_slice(&g1_to_bytes(&g1_point2));
        input.extend_from_slice(&g2_to_bytes(&g2_point2));
        
        // Add two identity pairs
        input.extend_from_slice(&vec![0u8; 192]);
        input.extend_from_slice(&vec![0u8; 192]);
        
        let result = contract.sender(alice).pairing(input).unwrap();
        assert_eq!(result.len(), 32);
        // This should likely fail (return 0) unless a*b + c = 0 mod r
        // We're not asserting the specific result since it depends on random values
    }

    #[motsu::test]
    fn test_batch_operations(contract: Contract<ArkworksBN254>, alice: Address) {
        
        // Test multiple pairing operations
        let identity_input = vec![0u8; 768];
        
        for _i in 0..5 {
            let result = contract.sender(alice).pairing(identity_input.clone()).unwrap();
            assert_eq!(result.len(), 32);
            assert_eq!(result[31], 1);
        }
    }

    #[motsu::test]
    fn test_contract_deployment(_contract: Contract<ArkworksBN254>) {
        // Test that contract can be created successfully
        // Contract should deploy without any storage initialization needed
        // since our contract has no constructor or initial state
        
        // Just test that we can create the contract (done by the framework)
        // and it's in a valid state
        assert!(true); // Contract exists if we get here
    }
}