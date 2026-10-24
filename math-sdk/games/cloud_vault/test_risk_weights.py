"""Tail metric regressions at probability-atom boundaries."""
import unittest
from risk_weights import distribution_metrics,violations

class TailMetrics(unittest.TestCase):
    def test_fraction_of_zero_atom_still_counts_in_worst_point_one_percent(self):
        result=distribution_metrics([0,2500000],[.9995,.0005],1)
        self.assertAlmostEqual(result['cvar_absolute'],12500)

    def test_two_upper_atoms_share_exact_tail_mass(self):
        result=distribution_metrics([0,1000000,2500000],[.999,.0005,.0005],1)
        self.assertAlmostEqual(result['cvar_absolute'],17500)

    def test_bet_cost_does_not_hide_raw_tail_probability(self):
        low=distribution_metrics([0,2500000],[.9995,.0005],1)
        high=distribution_metrics([0,2500000],[.9995,.0005],1000)
        self.assertEqual(low['tail25000'],high['tail25000'])
        self.assertEqual(low['cvar_absolute'],high['cvar_absolute'])
        self.assertAlmostEqual(low['cvar_per_cost']/1000,high['cvar_per_cost'])

    def test_rtp_alone_does_not_imply_acceptable_risk(self):
        result=distribution_metrics([0,1000000],[.999904,.000096],1)
        self.assertAlmostEqual(result['rtp'],.96)
        self.assertIn('std_per_cost',violations(result,'base'))

if __name__=='__main__':unittest.main()
