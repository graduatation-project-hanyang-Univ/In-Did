const proofReqTest = {
  name: 'test-proof-req',
  requested_attributes: {
    attr1_referent: { name: 'name' },
  },
  requested_predicates: {
    predicate1_referent: {
      name: 'age',
      p_type: '>=',
      p_value: 18,
    },
  },
  non_revoked: {
    from: 80,
    to: 100,
  },
};

module.exports = {
  proofReqTest,
};
